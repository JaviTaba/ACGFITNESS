import { describe, expect, it, beforeEach } from "vitest";
import {
  createTrackingService,
} from "./tracking.service";
import { InMemoryTrackingRepository } from "@/server/testing/inMemoryTrackingRepository";

describe("trackingService", () => {
  let repository: InMemoryTrackingRepository;

  beforeEach(() => {
    repository = new InMemoryTrackingRepository();
  });

  it("records a meal with macro information", async () => {
    const service = createTrackingService({ repository });

    const result = await service.logMeal({
      userId: "alice",
      loggedAt: new Date("2024-01-01T08:00:00Z"),
      name: "Breakfast",
      calories: 420,
      proteinGrams: 30,
      carbsGrams: 35,
      fatsGrams: 18,
    });

    expect(result.id).toBeDefined();
    expect(result.calories).toBe(420);
  });

  it("aggregates a day snapshot with totals and latest weight", async () => {
    const service = createTrackingService({ repository });
    await service.logWeight({
      userId: "alice",
      loggedAt: new Date("2024-01-01T06:00:00Z"),
      weightKg: 68.3,
      source: "scale",
    });
    await service.logMeal({
      userId: "alice",
      loggedAt: new Date("2024-01-01T08:00:00Z"),
      name: "Breakfast",
      calories: 420,
      proteinGrams: 30,
      carbsGrams: 35,
      fatsGrams: 18,
    });

    await service.logMeal({
      userId: "alice",
      loggedAt: new Date("2024-01-01T13:00:00Z"),
      name: "Lunch",
      calories: 620,
      proteinGrams: 42,
      carbsGrams: 60,
      fatsGrams: 21,
    });

    const summary = await service.getDailySummary({
      userId: "alice",
      day: new Date("2024-01-01T12:00:00Z"),
    });

    expect(summary.totalCalories).toBe(1040);
    expect(summary.totalProteinGrams).toBe(72);
    expect(summary.latestWeightKg).toBeCloseTo(68.3);
  });

  it("returns weight history within a range", async () => {
    const service = createTrackingService({ repository });
    await service.logWeight({
      userId: "alice",
      loggedAt: new Date("2024-01-01T06:00:00Z"),
      weightKg: 68.3,
      source: "scale",
    });
    await service.logWeight({
      userId: "alice",
      loggedAt: new Date("2024-01-10T06:00:00Z"),
      weightKg: 67.8,
      source: "scale",
    });
    await service.logWeight({
      userId: "alice",
      loggedAt: new Date("2024-02-10T06:00:00Z"),
      weightKg: 67.1,
      source: "scale",
    });

    const results = await service.getWeightTrend({
      userId: "alice",
      start: new Date("2024-01-01T00:00:00Z"),
      end: new Date("2024-01-31T23:59:59Z"),
      limit: 90,
    });

    expect(results).toHaveLength(2);
    expect(results[0]?.weightKg).toBeCloseTo(68.3);
    expect(results[1]?.weightKg).toBeCloseTo(67.8);
  });
});
