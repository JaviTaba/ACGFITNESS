import { describe, expect, it } from "vitest";
import { buildMeasurementLogHandlers } from "./route";
import { createTrackingService } from "@/server/domain/tracking/tracking.service";
import { InMemoryTrackingRepository } from "@/server/testing/inMemoryTrackingRepository";

describe("POST /api/logs/measurements", () => {
  it("stores a measurement entry", async () => {
    const trackingService = createTrackingService({
      repository: new InMemoryTrackingRepository(),
    });
    const { POST } = buildMeasurementLogHandlers({ trackingService });

    const response = await POST(
      new Request("http://localhost/api/logs/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "alice",
          loggedAt: "2024-01-01T07:00:00Z",
          unit: "cm",
          values: { waist: 72.5, hips: 95 },
        }),
      }),
    );

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.values.waist).toBeCloseTo(72.5);
  });

  it("validates measurement payload", async () => {
    const { POST } = buildMeasurementLogHandlers({
      trackingService: createTrackingService({
        repository: new InMemoryTrackingRepository(),
      }),
    });

    const response = await POST(
      new Request("http://localhost/api/logs/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "alice" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.stringContaining("Validation") }),
    );
  });
});
