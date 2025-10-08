import { DailySummary, WeightEntry } from "@/server/domain/tracking/tracking.service";
import { StreakSummary } from "@/server/domain/tracking/streak.service";
import { PostEntity } from "@/server/domain/social/social.service";
import { ProfileOverview } from "@/lib/types";

export const demoSummary: DailySummary = {
  userId: "demo-user",
  day: new Date(),
  totalCalories: 1980,
  totalProteinGrams: 135,
  totalCarbsGrams: 190,
  totalFatsGrams: 65,
  dailyStepsGoal: 10000,
  dailyStepsCompleted: 8450,
  meals: [
    {
      id: "meal-1",
      userId: "demo-user",
      loggedAt: new Date(),
      name: "Power Breakfast",
      calories: 520,
      proteinGrams: 38,
      carbsGrams: 45,
      fatsGrams: 18,
      notes: "Overnight oats with berries and almonds",
      createdAt: new Date(),
    },
  ],
  workouts: [
    {
      id: "workout-1",
      userId: "demo-user",
      loggedAt: new Date(),
      title: "Strength Circuit",
      durationMinutes: 45,
      perceivedIntensity: "hard",
      exercises: [
        {
          name: "Back Squat",
          sets: [
            { reps: 5, weightKg: 80 },
            { reps: 5, weightKg: 85 },
            { reps: 5, weightKg: 90 },
          ],
        },
      ],
      notes: "Felt strong, focus on depth",
      createdAt: new Date(),
    },
  ],
  latestWeightKg: 72.4,
  latestMeasurement: {
    id: "measurement-1",
    userId: "demo-user",
    loggedAt: new Date(),
    unit: "cm",
    values: { waist: 82, hips: 96, chest: 102 },
    createdAt: new Date(),
  },
};

export const demoWeightTrend: WeightEntry[] = Array.from({ length: 8 }).map(
  (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (7 - index) * 7);
    return {
      id: `weight-${index}`,
      userId: "demo-user",
      loggedAt: date,
      weightKg: 75 - index * 0.6,
      source: "scale",
      note: null,
      createdAt: date,
    } satisfies WeightEntry;
  },
);

export const demoPosts: PostEntity[] = [
  {
    id: "post-1",
    authorId: "friend-1",
    content:
      "Crushed the interval session today! 6x400m at 4:10/km - feeling stronger every week.",
    privacy: "public",
<<<<<<< HEAD
    location: "Riverside Track",
=======
>>>>>>> aab1da3 (first version)
    attachments: [
      {
        kind: "image",
        url: "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb",
        alt: "Running shoes on track",
      },
    ],
<<<<<<< HEAD
    highFives: 18,
    comments: [
      {
        id: "comment-1",
        authorId: "demo-user",
        content: "Splits looked so smooth—keep that cadence!",
        createdAt: new Date(),
      },
    ],
=======
>>>>>>> aab1da3 (first version)
    createdAt: new Date(),
  },
  {
    id: "post-2",
    authorId: "demo-user",
    content:
      "Week 4 of the strength cycle wrapped. Adding +5kg to the deadlift next week (let's go!)",
    privacy: "close_friends",
<<<<<<< HEAD
    location: "Forge Lab Strength",
    attachments: [],
    highFives: 9,
    comments: [
      {
        id: "comment-2",
        authorId: "friend-1",
        content: "Big jumps! Film the next set so we can check form.",
        createdAt: new Date(),
      },
      {
        id: "comment-3",
        authorId: "friend-2",
        content: "Save some PRs for the rest of us 😅",
        createdAt: new Date(),
      },
    ],
=======
    attachments: [],
>>>>>>> aab1da3 (first version)
    createdAt: new Date(),
  },
];

export const demoProfile: ProfileOverview = {
  displayName: "Alex Martinez",
  username: "alexmartinez",
  joinDate: "2023-04-12",
  goals: [
    { title: "Consistent Workouts", progress: 0.75, target: "4 sessions/week" },
    { title: "Sleep Routine", progress: 0.6, target: "7h avg" },
    { title: "Water Intake", progress: 0.9, target: "3L daily" },
  ],
  streakDays: 18,
  badges: [
    {
      id: "badge-1",
      label: "Morning Warrior",
      description: "Logged 15 workouts before 8am",
    },
    {
      id: "badge-2",
      label: "Consistency Champ",
      description: "Completed 4 weeks without missing a workout",
    },
  ],
};

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

const recentActivity = Array.from({ length: 14 }).map((_, index) => {
  const day = new Date(today);
  day.setUTCDate(day.getUTCDate() - (13 - index));
  const loggedDays = new Set([0, 1, 2, 3, 4].map((offset) => {
    const target = new Date(today);
    target.setUTCDate(target.getUTCDate() - offset);
    return target.toISOString().slice(0, 10);
  }));
  return {
    date: day,
    logged: loggedDays.has(day.toISOString().slice(0, 10)),
  };
});

export const demoStreak: StreakSummary = {
  userId: "demo-user",
  today,
  currentStreak: 5,
  longestStreak: 12,
  active: true,
  lastActivityDate: today,
  recentActivity,
  goals: [
    {
      id: "streak-3",
      label: "3-Day Spark",
      description: "Three straight days of logged meals or workouts.",
      targetDays: 3,
      achieved: true,
      achievedAt: new Date(today),
    },
    {
      id: "streak-7",
      label: "Momentum Week",
      description: "A full week of consistent logging. Share the win!",
      targetDays: 7,
      achieved: false,
    },
    {
      id: "streak-14",
      label: "Two-Week Groove",
      description: "Fourteen days in a row. You're unstoppable.",
      targetDays: 14,
      achieved: false,
    },
    {
      id: "streak-30",
      label: "Monthly Focus",
      description: "Thirty consecutive days of showing up for yourself.",
      targetDays: 30,
      achieved: false,
    },
    {
      id: "streak-60",
      label: "Season Starter",
      description: "Sixty straight days. Friends have to notice this.",
      targetDays: 60,
      achieved: false,
    },
  ],
  nextGoal: {
    id: "streak-7",
    label: "Momentum Week",
    description: "A full week of consistent logging. Share the win!",
    targetDays: 7,
    achieved: false,
  },
};
