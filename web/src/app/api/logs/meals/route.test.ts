import { describe, expect, it } from "vitest";
import { buildMealLogHandlers } from "./route";
import { InMemoryTrackingRepository } from "@/server/testing/inMemoryTrackingRepository";
import { createTrackingService } from "@/server/domain/tracking/tracking.service";

describe("POST /api/logs/meals", () => {
  it("creates a meal log", async () => {
    const repository = new InMemoryTrackingRepository();
    const trackingService = createTrackingService({ repository });
    const { POST } = buildMealLogHandlers({ trackingService });

    const response = await POST(
      new Request("http://localhost/api/logs/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "alice",
          loggedAt: "2024-01-01T08:00:00Z",
          name: "Breakfast",
          calories: 520,
          proteinGrams: 30,
          carbsGrams: 45,
          fatsGrams: 20,
        }),
      }),
    );

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe("Breakfast");
    expect(data.calories).toBe(520);
  });

  it("validates payload", async () => {
    const { POST } = buildMealLogHandlers({
      trackingService: createTrackingService({
        repository: new InMemoryTrackingRepository(),
      }),
    });

    const response = await POST(
      new Request("http://localhost/api/logs/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "" }),
      }),
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({
        error: expect.stringContaining("Validation"),
      }),
    );
  });
});
