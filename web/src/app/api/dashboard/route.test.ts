import { describe, expect, it, beforeEach } from "vitest";
import { buildDashboardHandlers } from "./route";
import { InMemoryTrackingRepository } from "@/server/testing/inMemoryTrackingRepository";
import { createTrackingService } from "@/server/domain/tracking/tracking.service";
import { createStreakService } from "@/server/domain/tracking/streak.service";

describe("GET /api/dashboard", () => {
  const baseUrl =
    "http://localhost/api/dashboard?userId=alice&day=2024-01-01T12:00:00Z";
  let trackingService: ReturnType<typeof createTrackingService>;
  let streakService: ReturnType<typeof createStreakService>;
  let repository: InMemoryTrackingRepository;

  beforeEach(async () => {
    repository = new InMemoryTrackingRepository();
    trackingService = createTrackingService({ repository });
    streakService = createStreakService({ repository });

    await trackingService.logMeal({
      userId: "alice",
      loggedAt: new Date("2024-01-01T08:00:00Z"),
      name: "Breakfast",
      calories: 420,
      proteinGrams: 25,
      carbsGrams: 50,
      fatsGrams: 15,
    });
    await trackingService.logWorkout({
      userId: "alice",
      loggedAt: new Date("2024-01-01T09:00:00Z"),
      title: "Morning Run",
      perceivedIntensity: "moderate",
      exercises: [
        {
          name: "Run",
          sets: [{ reps: 1, durationSeconds: 1800, distanceKm: 5 }],
        },
      ],
    });
    await trackingService.logWeight({
      userId: "alice",
      loggedAt: new Date("2023-12-31T07:00:00Z"),
      weightKg: 68.2,
      source: "scale",
    });
  });

  it("returns a daily summary payload", async () => {
    const { GET } = buildDashboardHandlers({
      trackingService,
      streakService,
    });
    const response = await GET(new Request(baseUrl));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.summary.totalCalories).toBe(420);
    expect(json.summary.meals).toHaveLength(1);
    expect(json.summary.workouts).toHaveLength(1);
    expect(json.summary.latestWeightKg).toBeCloseTo(68.2);
    expect(json.weightTrend).toHaveLength(1);
    expect(json.streak.currentStreak).toBe(1);
    expect(json.streak.goals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ targetDays: 3 }),
      ]),
    );
  });

  it("returns 400 when userId missing", async () => {
    const { GET } = buildDashboardHandlers({
      trackingService,
      streakService,
    });
    const response = await GET(
      new Request("http://localhost/api/dashboard"),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        error: expect.stringContaining("userId is required"),
      }),
    );
  });
});
