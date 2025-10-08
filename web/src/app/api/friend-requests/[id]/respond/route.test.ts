import { describe, expect, it } from "vitest";
import { buildFriendRequestResponseHandlers } from "./route";
import { InMemoryFriendshipRepository } from "@/server/testing/inMemoryFriendshipRepository";

describe("POST /api/friend-requests/:id/respond", () => {
  it("accepts a request", async () => {
    const repository = new InMemoryFriendshipRepository();
    const serviceRequest = await repository.createFriendRequest({
      requesterId: "alice",
      addresseeId: "bob",
      message: null,
    });

    const { POST } = buildFriendRequestResponseHandlers({ repository });

    const response = await POST(
      new Request(
        `http://localhost/api/friend-requests/${serviceRequest.id}/respond`,
        {
          method: "POST",
          body: JSON.stringify({ action: "accept", responderId: "bob" }),
          headers: { "Content-Type": "application/json" },
        },
      ),
      { params: { id: serviceRequest.id } },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("accepted");
  });

  it("rejects missing action", async () => {
    const repository = new InMemoryFriendshipRepository();
    const requestRecord = await repository.createFriendRequest({
      requesterId: "alice",
      addresseeId: "bob",
      message: null,
    });
    const { POST } = buildFriendRequestResponseHandlers({ repository });

    const response = await POST(
      new Request(
        `http://localhost/api/friend-requests/${requestRecord.id}/respond`,
        {
          method: "POST",
          body: JSON.stringify({ responderId: "bob" }),
          headers: { "Content-Type": "application/json" },
        },
      ),
      { params: { id: requestRecord.id } },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        error: expect.stringContaining("action and responderId"),
      }),
    );
  });
});
