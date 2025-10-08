import { randomUUID } from "node:crypto";
import {
  MeasurementEntry,
  MealLog,
  TrackingRepository,
  WeightEntry,
  WorkoutEntry,
} from "@/server/domain/tracking/tracking.service";

export class InMemoryTrackingRepository implements TrackingRepository {
  private meals = new Map<string, MealLog>();
  private weights = new Map<string, WeightEntry>();
  private measurements = new Map<string, MeasurementEntry>();
  private workouts = new Map<string, WorkoutEntry>();

  async createMeal(
    payload: Omit<MealLog, "id" | "createdAt">,
  ): Promise<MealLog> {
    const record: MealLog = {
      id: randomUUID(),
      createdAt: new Date(),
      ...payload,
    };
    this.meals.set(record.id, record);
    return record;
  }

  async createWeight(
    payload: Omit<WeightEntry, "id" | "createdAt">,
  ): Promise<WeightEntry> {
    const record: WeightEntry = {
      id: randomUUID(),
      createdAt: new Date(),
      ...payload,
    };
    this.weights.set(record.id, record);
    return record;
  }

  async createMeasurement(
    payload: Omit<MeasurementEntry, "id" | "createdAt">,
  ): Promise<MeasurementEntry> {
    const record: MeasurementEntry = {
      id: randomUUID(),
      createdAt: new Date(),
      ...payload,
    };
    this.measurements.set(record.id, record);
    return record;
  }

  async createWorkout(
    payload: Omit<WorkoutEntry, "id" | "createdAt">,
  ): Promise<WorkoutEntry> {
    const record: WorkoutEntry = {
      id: randomUUID(),
      createdAt: new Date(),
      ...payload,
    };
    this.workouts.set(record.id, record);
    return record;
  }

  async listMealsByUserAndDate(
    userId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<MealLog[]> {
    return [...this.meals.values()].filter(
      (meal) =>
        meal.userId === userId &&
        meal.loggedAt >= dayStart &&
        meal.loggedAt <= dayEnd,
    );
  }

  async listWorkoutsByUserAndDate(
    userId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<WorkoutEntry[]> {
    return [...this.workouts.values()].filter(
      (workout) =>
        workout.userId === userId &&
        workout.loggedAt >= dayStart &&
        workout.loggedAt <= dayEnd,
    );
  }

  async listWeightsForUser(
    userId: string,
    limit: number,
  ): Promise<WeightEntry[]> {
    return [...this.weights.values()]
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime())
      .slice(0, limit);
  }

  async listMeasurementsForUser(
    userId: string,
    limit: number,
  ): Promise<MeasurementEntry[]> {
    return [...this.measurements.values()]
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime())
      .slice(0, limit);
  }

  async listWeightHistory(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<WeightEntry[]> {
    return [...this.weights.values()]
      .filter(
        (entry) =>
          entry.userId === userId &&
          entry.loggedAt >= start &&
          entry.loggedAt <= end,
      )
      .sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime());
  }

  async listActivityDays(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Date[]> {
    const startOfUtcDay = (value: Date) =>
      new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    const toDayKey = (value: Date) =>
      `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;

    const normalized = new Map<string, Date>();

    const withinRange = (timestamp: Date) =>
      timestamp.getTime() >= start.getTime() &&
      timestamp.getTime() <= end.getTime();

    for (const meal of this.meals.values()) {
      if (meal.userId !== userId || !withinRange(meal.loggedAt)) {
        continue;
      }
      const day = startOfUtcDay(meal.loggedAt);
      const key = toDayKey(day);
      if (!normalized.has(key)) {
        normalized.set(key, day);
      }
    }

    for (const workout of this.workouts.values()) {
      if (workout.userId !== userId || !withinRange(workout.loggedAt)) {
        continue;
      }
      const day = startOfUtcDay(workout.loggedAt);
      const key = toDayKey(day);
      if (!normalized.has(key)) {
        normalized.set(key, day);
      }
    }

    return Array.from(normalized.values()).sort(
      (a, b) => a.getTime() - b.getTime(),
    );
  }
}
