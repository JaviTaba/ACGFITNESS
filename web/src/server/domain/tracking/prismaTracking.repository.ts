import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import {
  MeasurementEntry,
  MealLog,
  TrackingRepository,
  WeightEntry,
  WorkoutEntry,
} from "./tracking.service";

function mapMeal(record: Prisma.MealLogGetPayload<object>): MealLog {
  return {
    id: record.id,
    userId: record.userId,
    loggedAt: record.loggedAt,
    name: record.name,
    calories: record.calories,
    proteinGrams: record.proteinGrams,
    carbsGrams: record.carbsGrams,
    fatsGrams: record.fatsGrams,
    notes: record.notes,
    createdAt: record.createdAt,
  };
}

function mapWeight(record: Prisma.WeightEntryGetPayload<object>): WeightEntry {
  return {
    id: record.id,
    userId: record.userId,
    loggedAt: record.loggedAt,
    weightKg: Number(record.weightKg),
    source: record.source,
    note: record.note,
    createdAt: record.createdAt,
  };
}

function mapMeasurement(
  record: Prisma.MeasurementEntryGetPayload<object>,
): MeasurementEntry {
  return {
    id: record.id,
    userId: record.userId,
    loggedAt: record.loggedAt,
    unit: record.unit === "IN" ? "in" : "cm",
    values: (record.values ?? {}) as Record<string, number>,
    createdAt: record.createdAt,
  };
}

function mapWorkout(record: Prisma.WorkoutGetPayload<{
  include: { exercises: true };
}>): WorkoutEntry {
  return {
    id: record.id,
    userId: record.userId,
    loggedAt: record.loggedAt,
    title: record.title,
    durationMinutes: record.durationMinutes,
    perceivedIntensity: record.perceivedIntensity
      ? (record.perceivedIntensity.toLowerCase() as WorkoutEntry["perceivedIntensity"])
      : null,
    notes: record.notes,
    exercises: record.exercises.map((exercise) => ({
      name: exercise.name,
      sets: (exercise.sets as Array<{
        reps: number;
        weightKg?: number | null;
        distanceKm?: number | null;
        durationSeconds?: number | null;
      }>) ?? [],
    })),
    createdAt: record.createdAt,
  };
}

export class PrismaTrackingRepository implements TrackingRepository {
  async createMeal(
    payload: Omit<MealLog, "id" | "createdAt">,
  ): Promise<MealLog> {
    const created = await prisma.mealLog.create({
      data: {
        userId: payload.userId,
        loggedAt: payload.loggedAt,
        name: payload.name,
        calories: payload.calories,
        proteinGrams: payload.proteinGrams,
        carbsGrams: payload.carbsGrams,
        fatsGrams: payload.fatsGrams,
        notes: payload.notes,
      },
    });
    return mapMeal(created);
  }

  async createWeight(
    payload: Omit<WeightEntry, "id" | "createdAt">,
  ): Promise<WeightEntry> {
    const created = await prisma.weightEntry.create({
      data: {
        userId: payload.userId,
        loggedAt: payload.loggedAt,
        weightKg: payload.weightKg,
        source: payload.source,
        note: payload.note,
      },
    });
    return mapWeight(created);
  }

  async createMeasurement(
    payload: Omit<MeasurementEntry, "id" | "createdAt">,
  ): Promise<MeasurementEntry> {
    const created = await prisma.measurementEntry.create({
      data: {
        userId: payload.userId,
        loggedAt: payload.loggedAt,
        unit: payload.unit.toUpperCase() as Prisma.MeasurementUnit,
        values: payload.values as Prisma.JsonObject,
      },
    });
    return mapMeasurement(created);
  }

  async createWorkout(
    payload: Omit<WorkoutEntry, "id" | "createdAt">,
  ): Promise<WorkoutEntry> {
    const created = await prisma.workout.create({
      data: {
        userId: payload.userId,
        loggedAt: payload.loggedAt,
        title: payload.title,
        durationMinutes: payload.durationMinutes ?? null,
        perceivedIntensity: payload.perceivedIntensity
          ? (payload.perceivedIntensity.toUpperCase() as Prisma.WorkoutIntensity)
          : null,
        notes: payload.notes,
        exercises: {
          create: payload.exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets as unknown as Prisma.JsonValue,
          })),
        },
      },
      include: {
        exercises: true,
      },
    });
    return mapWorkout(created);
  }

  async listMealsByUserAndDate(
    userId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<MealLog[]> {
    const rows = await prisma.mealLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      orderBy: { loggedAt: "asc" },
    });
    return rows.map(mapMeal);
  }

  async listWorkoutsByUserAndDate(
    userId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<WorkoutEntry[]> {
    const rows = await prisma.workout.findMany({
      where: {
        userId,
        loggedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: { exercises: true },
      orderBy: { loggedAt: "asc" },
    });
    return rows.map(mapWorkout);
  }

  async listWeightsForUser(
    userId: string,
    limit: number,
  ): Promise<WeightEntry[]> {
    const rows = await prisma.weightEntry.findMany({
      where: { userId },
      orderBy: { loggedAt: "desc" },
      take: limit,
    });
    return rows.map(mapWeight);
  }

  async listMeasurementsForUser(
    userId: string,
    limit: number,
  ): Promise<MeasurementEntry[]> {
    const rows = await prisma.measurementEntry.findMany({
      where: { userId },
      orderBy: { loggedAt: "desc" },
      take: limit,
    });
    return rows.map(mapMeasurement);
  }

  async listWeightHistory(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<WeightEntry[]> {
    const rows = await prisma.weightEntry.findMany({
      where: {
        userId,
        loggedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { loggedAt: "asc" },
    });
    return rows.map(mapWeight);
  }

  async listActivityDays(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Date[]> {
    const [mealLogs, workoutLogs] = await Promise.all([
      prisma.mealLog.findMany({
        where: {
          userId,
          loggedAt: {
            gte: start,
            lte: end,
          },
        },
        select: { loggedAt: true },
      }),
      prisma.workout.findMany({
        where: {
          userId,
          loggedAt: {
            gte: start,
            lte: end,
          },
        },
        select: { loggedAt: true },
      }),
    ]);

    const toDayKey = (value: Date) =>
      `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
    const startOfUtcDay = (value: Date) =>
      new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

    const normalized = new Map<string, Date>();
    for (const entry of [...mealLogs, ...workoutLogs]) {
      const day = startOfUtcDay(entry.loggedAt);
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
