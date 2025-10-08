import { describe, expect, it } from "vitest";
import { buildPostHandlers } from "./route";
import {
  InMemoryFriendGraph,
  InMemoryPostRepository,
} from "@/server/testing/inMemorySocialRepositories";
import { createSocialService } from "@/server/domain/social/social.service";

describe("POST /api/posts", () => {
  it("publishes a post", async () => {
    const socialService = createSocialService({
      repository: new InMemoryPostRepository(),
      friendGraph: new InMemoryFriendGraph(),
    });
    const { POST } = buildPostHandlers({ socialService });

    const response = await POST(
      new Request("http://localhost/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: "alice",
          content: "Goal smashed! 💪",
          privacy: "friends",
          attachments: [
            { kind: "image", url: "https://example.com/progress.jpg" },
          ],
<<<<<<< HEAD
          location: "  Community Gym  ",
=======
>>>>>>> aab1da3 (first version)
        }),
      }),
    );

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.content).toBe("Goal smashed! 💪");
<<<<<<< HEAD
    expect(payload.location).toBe("Community Gym");
    expect(payload.highFives).toBe(0);
    expect(payload.comments).toEqual([]);
=======
>>>>>>> aab1da3 (first version)
  });

  it("validates post input", async () => {
    const { POST } = buildPostHandlers({
      socialService: createSocialService({
        repository: new InMemoryPostRepository(),
        friendGraph: new InMemoryFriendGraph(),
      }),
    });

    const response = await POST(
      new Request("http://localhost/api/posts", {
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
