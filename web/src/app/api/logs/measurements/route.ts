import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createTrackingService,
  TrackingService,
} from "@/server/domain/tracking/tracking.service";
import { PrismaTrackingRepository } from "@/server/domain/tracking/prismaTracking.repository";

interface HandlerDependencies {
  trackingService?: TrackingService;
}

export function buildMeasurementLogHandlers(
  dependencies: HandlerDependencies = {},
) {
  const trackingService =
    dependencies.trackingService ??
    createTrackingService({ repository: new PrismaTrackingRepository() });

  const POST = async (request: Request) => {
    try {
      const body = await request.json();
      const result = await trackingService.logMeasurement(body);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: `Validation error: ${error.message}` },
          { status: 400 },
        );
      }
      console.error("Unexpected error logging measurement", error);
      return NextResponse.json(
        { error: "Unexpected error logging measurement." },
        { status: 500 },
      );
    }
  };

  return { POST };
}

export const { POST } = buildMeasurementLogHandlers();
