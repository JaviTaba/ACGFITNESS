import { describe, expect, it } from "vitest";
import { buildProfileHandlers } from "./route";
import type { ProfileOverview } from "@/lib/types";

describe("GET /api/profile", () => {
  it("returns profile payload", async () => {
    const mockProfile: ProfileOverview = {
      displayName: "Test User",
      username: "test",
      joinDate: "2023-01-01",
      goals: [],
      streakDays: 5,
      badges: [],
    };

    const { GET } = buildProfileHandlers({
      getProfile: async () => mockProfile,
    });

    const response = await GET(
      new Request("http://localhost/api/profile?userId=alice"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(mockProfile);
  });

  it("validates userId", async () => {
    const { GET } = buildProfileHandlers();
    const response = await GET(new Request("http://localhost/api/profile"));
    expect(response.status).toBe(400);
  });
});
