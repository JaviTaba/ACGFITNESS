import { z } from "zod";

export interface MealLog {
  id: string;
  userId: string;
  loggedAt: Date;
  name: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  notes?: string | null;
  createdAt: Date;
}

export interface WeightEntry {
  id: string;
  userId: string;
  loggedAt: Date;
  weightKg: number;
  source: string;
  createdAt: Date;
  note?: string | null;
}

export interface MeasurementEntry {
  id: string;
  userId: string;
  loggedAt: Date;
  unit: "cm" | "in";
  values: Record<string, number>;
  createdAt: Date;
}

export interface WorkoutEntry {
  id: string;
  userId: string;
  loggedAt: Date;
  title: string;
  durationMinutes?: number | null;
  perceivedIntensity?: "easy" | "moderate" | "hard" | null;
  exercises: Array<{
    name: string;
    sets: Array<{
      reps: number;
      weightKg?: number | null;
      distanceKm?: number | null;
      durationSeconds?: number | null;
    }>;
  }>;
  notes?: string | null;
  createdAt: Date;
}

export interface TrackingRepository {
  createMeal(payload: Omit<MealLog, "id" | "createdAt">): Promise<MealLog>;
  createWeight(
    payload: Omit<WeightEntry, "id" | "createdAt">,
  ): Promise<WeightEntry>;
  createMeasurement(
    payload: Omit<MeasurementEntry, "id" | "createdAt">,
  ): Promise<MeasurementEntry>;
  createWorkout(
    payload: Omit<WorkoutEntry, "id" | "createdAt">,
  ): Promise<WorkoutEntry>;
  listMealsByUserAndDate(
    userId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<MealLog[]>;
  listWorkoutsByUserAndDate(
    userId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<WorkoutEntry[]>;
  listWeightsForUser(userId: string, limit: number): Promise<WeightEntry[]>;
  listMeasurementsForUser(
    userId: string,
    limit: number,
  ): Promise<MeasurementEntry[]>;
  listWeightHistory(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<WeightEntry[]>;
  listActivityDays(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Date[]>;
}

const mealSchema = z.object({
  userId: z.string().min(1),
  loggedAt: z.coerce.date(),
  name: z.string().min(1),
  calories: z.number().nonnegative(),
  proteinGrams: z.number().nonnegative(),
  carbsGrams: z.number().nonnegative(),
  fatsGrams: z.number().nonnegative(),
  notes: z.string().max(500).optional(),
});

const weightSchema = z.object({
  userId: z.string().min(1),
  loggedAt: z.coerce.date(),
  weightKg: z.number().positive(),
  source: z.string().min(1),
  note: z.string().max(500).optional(),
});

const measurementSchema = z.object({
  userId: z.string().min(1),
  loggedAt: z.coerce.date(),
  unit: z.enum(["cm", "in"]).default("cm"),
  values: z
    .record(z.string(), z.coerce.number().nonnegative())
    .refine((values) => Object.keys(values).length > 0, {
      message: "At least one measurement is required.",
    }),
});

const workoutSchema = z.object({
  userId: z.string().min(1),
  loggedAt: z.coerce.date(),
  title: z.string().min(1),
  durationMinutes: z.number().positive().optional(),
  perceivedIntensity: z.enum(["easy", "moderate", "hard"]).optional(),
  exercises: z
    .array(
      z.object({
        name: z.string().min(1),
        sets: z
          .array(
            z.object({
              reps: z.number().nonnegative(),
              weightKg: z.number().nonnegative().nullable().optional(),
              distanceKm: z.number().nonnegative().nullable().optional(),
              durationSeconds: z.number().nonnegative().nullable().optional(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
  notes: z.string().max(500).optional(),
});

const summarySchema = z.object({
  userId: z.string().min(1),
  day: z.coerce.date(),
});

const weightTrendSchema = z.object({
  userId: z.string().min(1),
  start: z.coerce.date(),
  end: z.coerce.date(),
  limit: z.number().int().positive().max(365).default(90),
});

export interface DailySummary {
  userId: string;
  day: Date;
  totalCalories: number;
  totalProteinGrams: number;
  totalCarbsGrams: number;
  totalFatsGrams: number;
  meals: MealLog[];
  workouts: WorkoutEntry[];
  latestWeightKg?: number;
  latestMeasurement?: MeasurementEntry;
  dailyStepsGoal?: number;
  dailyStepsCompleted?: number;
}

export interface TrackingService {
  logMeal(input: z.infer<typeof mealSchema>): Promise<MealLog>;
  logWeight(input: z.infer<typeof weightSchema>): Promise<WeightEntry>;
  logMeasurement(
    input: z.infer<typeof measurementSchema>,
  ): Promise<MeasurementEntry>;
  logWorkout(input: z.infer<typeof workoutSchema>): Promise<WorkoutEntry>;
  getDailySummary(input: z.infer<typeof summarySchema>): Promise<DailySummary>;
  getWeightTrend(
    input: z.infer<typeof weightTrendSchema>,
  ): Promise<WeightEntry[]>;
}

interface CreateTrackingServiceDependencies {
  repository: TrackingRepository;
}

function getDayBounds(day: Date): { start: Date; end: Date } {
  const start = new Date(day);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

export function createTrackingService({
  repository,
}: CreateTrackingServiceDependencies): TrackingService {
  const logMeal: TrackingService["logMeal"] = async (input) => {
    const payload = mealSchema.parse(input);
    return repository.createMeal(payload);
  };

  const logWeight: TrackingService["logWeight"] = async (input) => {
    const payload = weightSchema.parse(input);
    return repository.createWeight(payload);
  };

  const logMeasurement: TrackingService["logMeasurement"] = async (input) => {
    const payload = measurementSchema.parse(input);
    return repository.createMeasurement(payload);
  };

  const logWorkout: TrackingService["logWorkout"] = async (input) => {
    const payload = workoutSchema.parse(input);
    return repository.createWorkout(payload);
  };

  const getDailySummary: TrackingService["getDailySummary"] = async (input) => {
    const payload = summarySchema.parse(input);
    const { start, end } = getDayBounds(payload.day);

    const [meals, workouts, latestWeights, measurements] = await Promise.all([
      repository.listMealsByUserAndDate(payload.userId, start, end),
      repository.listWorkoutsByUserAndDate(payload.userId, start, end),
      repository.listWeightsForUser(payload.userId, 1),
      repository.listMeasurementsForUser(payload.userId, 1),
    ]);

    const totals = meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.proteinGrams;
        acc.carbs += meal.carbsGrams;
        acc.fats += meal.fatsGrams;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    return {
      userId: payload.userId,
      day: new Date(start),
      totalCalories: totals.calories,
      totalProteinGrams: totals.protein,
      totalCarbsGrams: totals.carbs,
      totalFatsGrams: totals.fats,
      meals,
      workouts,
      latestWeightKg: latestWeights.at(0)?.weightKg,
      latestMeasurement: measurements.at(0),
    };
  };

  const getWeightTrend: TrackingService["getWeightTrend"] = async (input) => {
    const payload = weightTrendSchema.parse(input);
    if (payload.start > payload.end) {
      throw new Error("start must be before end.");
    }
    const results = await repository.listWeightHistory(
      payload.userId,
      payload.start,
      payload.end,
    );
    return results.slice(-payload.limit);
  };

  return {
    logMeal,
    logWeight,
    logMeasurement,
    logWorkout,
    getDailySummary,
    getWeightTrend,
  };
}
