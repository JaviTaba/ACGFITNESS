import { describe, expect, it } from "vitest";
import { buildFriendRequestHandlers } from "./route";
import { InMemoryFriendshipRepository } from "@/server/testing/inMemoryFriendshipRepository";

describe("POST /api/friend-requests", () => {
  it("creates a friend request", async () => {
    const repository = new InMemoryFriendshipRepository();
    const { POST } = buildFriendRequestHandlers({ repository });
    const request = new Request("http://localhost/api/friend-requests", {
      method: "POST",
      body: JSON.stringify({
        requesterId: "alice",
        addresseeId: "bob",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.requesterId).toBe("alice");
    expect(payload.status).toBe("pending");
  });

  it("rejects missing identifiers", async () => {
    const { POST } = buildFriendRequestHandlers({
      repository: new InMemoryFriendshipRepository(),
    });

    const request = new Request("http://localhost/api/friend-requests", {
      method: "POST",
      body: JSON.stringify({ requesterId: "alice" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        error: expect.stringContaining("requesterId and addresseeId"),
      }),
    );
  });
});
