import { describe, expect, it } from "vitest";
import { buildWeightLogHandlers } from "./route";
import { InMemoryTrackingRepository } from "@/server/testing/inMemoryTrackingRepository";
import { createTrackingService } from "@/server/domain/tracking/tracking.service";

describe("POST /api/logs/weights", () => {
  it("creates a weight entry", async () => {
    const repository = new InMemoryTrackingRepository();
    const trackingService = createTrackingService({ repository });
    const { POST } = buildWeightLogHandlers({ trackingService });

    const response = await POST(
      new Request("http://localhost/api/logs/weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "alice",
          loggedAt: "2024-01-01T07:00:00Z",
          weightKg: 67.5,
          source: "scale",
        }),
      }),
    );

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.weightKg).toBeCloseTo(67.5);
  });

  it("returns validation errors", async () => {
    const { POST } = buildWeightLogHandlers({
      trackingService: createTrackingService({
        repository: new InMemoryTrackingRepository(),
      }),
    });

    const response = await POST(
      new Request("http://localhost/api/logs/weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.stringContaining("Validation") }),
    );
  });
});
