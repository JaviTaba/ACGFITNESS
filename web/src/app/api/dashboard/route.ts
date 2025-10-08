import { NextResponse } from "next/server";
import {
  createTrackingService,
  TrackingService,
} from "@/server/domain/tracking/tracking.service";
import {
  createStreakService,
  StreakService,
} from "@/server/domain/tracking/streak.service";
import { PrismaTrackingRepository } from "@/server/domain/tracking/prismaTracking.repository";

interface HandlerDependencies {
  trackingService?: TrackingService;
  streakService?: StreakService;
}

export function buildDashboardHandlers(
  dependencies: HandlerDependencies = {},
) {
  let repository: PrismaTrackingRepository | undefined;
  const resolveRepository = () => {
    if (!repository) {
      repository = new PrismaTrackingRepository();
    }
    return repository;
  };

  const trackingService =
    dependencies.trackingService ??
    createTrackingService({
      repository: resolveRepository(),
    });

  const streakService =
    dependencies.streakService ??
    createStreakService({
      repository: resolveRepository(),
    });

  const GET = async (request: Request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const dayParam = url.searchParams.get("day");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const day = dayParam ? new Date(dayParam) : new Date();

    try {
      const summary = await trackingService.getDailySummary({ userId, day });
      const rangeStart = new Date(day);
      rangeStart.setMonth(rangeStart.getMonth() - 3);
      const weightTrend = await trackingService.getWeightTrend({
        userId,
        start: rangeStart,
        end: day,
        limit: 90,
      });
      const streak = await streakService.getSummary({
        userId,
        today: day,
      });

      return NextResponse.json(
        {
          summary,
          weightTrend,
          streak,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Failed to fetch dashboard summary", error);
      return NextResponse.json(
        { error: "Unexpected error retrieving dashboard summary." },
        { status: 500 },
      );
    }
  };

  return { GET };
}

export const { GET } = buildDashboardHandlers();
