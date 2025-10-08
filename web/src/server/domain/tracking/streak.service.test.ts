import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryTrackingRepository } from "@/server/testing/inMemoryTrackingRepository";
import { createStreakService } from "./streak.service";

describe("streak.service", () => {
  let repository: InMemoryTrackingRepository;
  let service: ReturnType<typeof createStreakService>;
  const userId = "alice";

  beforeEach(() => {
    repository = new InMemoryTrackingRepository();
    service = createStreakService({ repository });
  });

  it("returns zero streak metrics when there is no activity", async () => {
    const summary = await service.getSummary({
      userId,
      today: new Date("2024-01-07T00:00:00Z"),
    });

    expect(summary.currentStreak).toBe(0);
    expect(summary.longestStreak).toBe(0);
    expect(summary.active).toBe(false);
    expect(summary.recentActivity).toHaveLength(14);
    expect(summary.nextGoal).toEqual(
      expect.objectContaining({
        targetDays: 3,
        achieved: false,
      }),
    );
  });

  it("tracks the current and longest streak across gaps", async () => {
    await logMeal("2024-01-01");
    await logMeal("2024-01-02");
    await logMeal("2024-01-04");
    await logMeal("2024-01-05");
    await logMeal("2024-01-06");

    const summary = await service.getSummary({
      userId,
      today: new Date("2024-01-06T00:00:00Z"),
    });

    expect(summary.currentStreak).toBe(3);
    expect(summary.longestStreak).toBe(3);
    expect(summary.lastActivityDate?.toISOString()).toBe(
      new Date("2024-01-06T00:00:00.000Z").toISOString(),
    );
    expect(summary.active).toBe(true);
  });

  it("surfaces a celebration prompt when the 7-day milestone is just reached", async () => {
    for (let day = 1; day <= 7; day += 1) {
      await logMeal(`2024-01-${String(day).padStart(2, "0")}`);
    }

    const januarySeventh = new Date("2024-01-07T00:00:00Z");
    const summary = await service.getSummary({
      userId,
      today: januarySeventh,
    });

    expect(summary.currentStreak).toBe(7);
    expect(summary.longestStreak).toBe(7);
    const weekGoal = summary.goals.find(
      (goal) => goal.targetDays === 7,
    );
    expect(weekGoal?.achieved).toBe(true);
    expect(weekGoal?.achievedAt?.toISOString()).toBe(
      januarySeventh.toISOString(),
    );
    expect(summary.nextGoal?.targetDays).toBeGreaterThan(7);
    expect(summary.celebration).toEqual(
      expect.objectContaining({
        milestoneId: "streak-7",
      }),
    );
  });

  it("does not repeat the celebration once the streak continues past 7 days", async () => {
    for (let day = 1; day <= 8; day += 1) {
      await logMeal(`2024-01-${String(day).padStart(2, "0")}`);
    }

    const summary = await service.getSummary({
      userId,
      today: new Date("2024-01-08T00:00:00Z"),
    });

    expect(summary.currentStreak).toBe(8);
    expect(summary.celebration).toBeUndefined();
  });

  async function logMeal(date: string) {
    await repository.createMeal({
      userId,
      loggedAt: new Date(`${date}T12:00:00Z`),
      name: "Meal",
      calories: 500,
      proteinGrams: 30,
      carbsGrams: 40,
      fatsGrams: 20,
    });
  }
});
