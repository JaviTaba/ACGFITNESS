import { describe, expect, it } from "vitest";
import { buildWorkoutLogHandlers } from "./route";
import { createTrackingService } from "@/server/domain/tracking/tracking.service";
import { InMemoryTrackingRepository } from "@/server/testing/inMemoryTrackingRepository";

describe("POST /api/logs/workouts", () => {
  it("stores a workout", async () => {
    const trackingService = createTrackingService({
      repository: new InMemoryTrackingRepository(),
    });
    const { POST } = buildWorkoutLogHandlers({ trackingService });

    const response = await POST(
      new Request("http://localhost/api/logs/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "alice",
          loggedAt: "2024-01-02T09:00:00Z",
          title: "Strength Session",
          exercises: [
            {
              name: "Bench Press",
              sets: [
                { reps: 8, weightKg: 40 },
                { reps: 6, weightKg: 45 },
              ],
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.title).toBe("Strength Session");
    expect(payload.exercises).toHaveLength(1);
  });

  it("returns 400 for invalid workout payload", async () => {
    const { POST } = buildWorkoutLogHandlers({
      trackingService: createTrackingService({
        repository: new InMemoryTrackingRepository(),
      }),
    });

    const response = await POST(
      new Request("http://localhost/api/logs/workouts", {
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
