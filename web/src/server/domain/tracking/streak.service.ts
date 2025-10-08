import { z } from "zod";
import { TrackingRepository } from "./tracking.service";

const DAY_IN_MS = 86_400_000;
const RECENT_ACTIVITY_WINDOW = 14;

const streakSummarySchema = z.object({
  userId: z.string().min(1),
  today: z.coerce.date().optional(),
  lookbackDays: z.number().int().positive().max(730).default(365),
});

interface StreakGoalDefinition {
  id: string;
  label: string;
  description: string;
  targetDays: number;
}

const STREAK_GOALS: StreakGoalDefinition[] = [
  {
    id: "streak-3",
    label: "3-Day Spark",
    description: "Three straight days of logged meals or workouts.",
    targetDays: 3,
  },
  {
    id: "streak-7",
    label: "Momentum Week",
    description: "A full week of consistent logging. Share the win!",
    targetDays: 7,
  },
  {
    id: "streak-14",
    label: "Two-Week Groove",
    description: "Fourteen days in a row. You're unstoppable.",
    targetDays: 14,
  },
  {
    id: "streak-30",
    label: "Monthly Focus",
    description: "Thirty consecutive days of showing up for yourself.",
    targetDays: 30,
  },
  {
    id: "streak-60",
    label: "Season Starter",
    description: "Sixty straight days. Friends have to notice this.",
    targetDays: 60,
  },
];

export interface StreakGoalSummary extends StreakGoalDefinition {
  achieved: boolean;
  achievedAt?: Date;
}

export interface StreakCelebration {
  milestoneId: string;
  unlockedAt: Date;
  headline: string;
  message: string;
  suggestedCaption: string;
}

export interface RecentActivityDay {
  date: Date;
  logged: boolean;
}

export interface StreakSummary {
  userId: string;
  today: Date;
  currentStreak: number;
  longestStreak: number;
  active: boolean;
  lastActivityDate?: Date;
  recentActivity: RecentActivityDay[];
  goals: StreakGoalSummary[];
  nextGoal?: StreakGoalSummary;
  celebration?: StreakCelebration;
}

export interface StreakService {
  getSummary(
    input: z.infer<typeof streakSummarySchema>,
  ): Promise<StreakSummary>;
}

interface CreateStreakServiceDependencies {
  repository: TrackingRepository;
}

const startOfUtcDay = (value: Date) =>
  new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

const endOfUtcDay = (value: Date) =>
  new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

const addDays = (value: Date, amount: number) => {
  const next = new Date(value);
  next.setUTCDate(value.getUTCDate() + amount);
  return next;
};

const dayKey = (value: Date) =>
  `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;

export function createStreakService({
  repository,
}: CreateStreakServiceDependencies): StreakService {
  const getSummary: StreakService["getSummary"] = async (input) => {
    const payload = streakSummarySchema.parse(input);
    const today = startOfUtcDay(payload.today ?? new Date());
    const rangeStart = addDays(today, -(payload.lookbackDays - 1));
    const rangeEnd = endOfUtcDay(today);

    const activityDaysRaw = await repository.listActivityDays(
      payload.userId,
      rangeStart,
      rangeEnd,
    );

    const activityDays = activityDaysRaw
      .map(startOfUtcDay)
      .sort((a, b) => a.getTime() - b.getTime());

    const daySet = new Set(activityDays.map(dayKey));
    const lastActivity =
      activityDays.length > 0
        ? activityDays[activityDays.length - 1]
        : undefined;

    let currentStreak = 0;
    let cursor = today;
    while (cursor.getTime() >= rangeStart.getTime()) {
      if (daySet.has(dayKey(cursor))) {
        currentStreak += 1;
        cursor = addDays(cursor, -1);
      } else {
        break;
      }
    }

    let longestStreak = 0;
    let runLength = 0;
    let previousDay: Date | undefined;
    const goalAchievedAt = new Map<string, Date>();

    for (const day of activityDays) {
      if (previousDay) {
        const diffDays = Math.round(
          (day.getTime() - previousDay.getTime()) / DAY_IN_MS,
        );
        runLength = diffDays === 1 ? runLength + 1 : 1;
      } else {
        runLength = 1;
      }

      longestStreak = Math.max(longestStreak, runLength);

      for (const goal of STREAK_GOALS) {
        if (!goalAchievedAt.has(goal.id) && runLength >= goal.targetDays) {
          goalAchievedAt.set(goal.id, day);
        }
      }

      previousDay = day;
    }

    const goals: StreakGoalSummary[] = STREAK_GOALS.map((goal) => {
      const achievedAt = goalAchievedAt.get(goal.id);
      return {
        ...goal,
        achieved: Boolean(achievedAt),
        achievedAt,
      };
    });

    const nextGoal = goals.find((goal) => !goal.achieved);

    const recentActivity: RecentActivityDay[] = Array.from(
      { length: RECENT_ACTIVITY_WINDOW },
      (_, index) => {
        const offset = RECENT_ACTIVITY_WINDOW - 1 - index;
        const day = addDays(today, -offset);
        return {
          date: day,
          logged: daySet.has(dayKey(day)),
        };
      },
    );

    const weekGoal = goals.find((goal) => goal.targetDays === 7);
    let celebration: StreakCelebration | undefined;
    if (
      weekGoal?.achieved &&
      weekGoal.achievedAt &&
      dayKey(weekGoal.achievedAt) === dayKey(today) &&
      currentStreak === weekGoal.targetDays
    ) {
      celebration = {
        milestoneId: weekGoal.id,
        unlockedAt: today,
        headline: "Seven-day streak unlocked!",
        message:
          "You logged workouts or meals every day this week. Keep the fire going and let your circle know.",
        suggestedCaption:
          "Seven days straight on ACOGO Fitness. Who's chasing the streak with me? 💥",
      };
    }

    return {
      userId: payload.userId,
      today,
      currentStreak,
      longestStreak,
      active: currentStreak > 0,
      lastActivityDate: lastActivity,
      recentActivity,
      goals,
      nextGoal,
      celebration,
    };
  };

  return {
    getSummary,
  };
}
