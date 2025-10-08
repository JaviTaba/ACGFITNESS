import { describe, it, expect, beforeEach } from "vitest";
import { createFriendshipService } from "./friendship.service";
import { InMemoryFriendshipRepository } from "@/server/testing/inMemoryFriendshipRepository";

describe("friendshipService", () => {
  let repository: InMemoryFriendshipRepository;

  beforeEach(() => {
    repository = new InMemoryFriendshipRepository();
    repository.clear();
  });

  it("creates a pending friend request when none exists", async () => {
    const service = createFriendshipService({ repository });
    const result = await service.sendFriendRequest({
      requesterId: "alice",
      addresseeId: "bob",
    });

    expect(result.status).toBe("pending");
    expect(result.requesterId).toBe("alice");
    expect(result.addresseeId).toBe("bob");
  });

  it("prevents duplicate pending requests", async () => {
    const service = createFriendshipService({ repository });

    await service.sendFriendRequest({
      requesterId: "alice",
      addresseeId: "bob",
    });

    await expect(
      service.sendFriendRequest({ requesterId: "alice", addresseeId: "bob" }),
    ).rejects.toThrowError(/already has a pending request/i);
  });

  it("prevents sending friend requests to self", async () => {
    const service = createFriendshipService({ repository });

    await expect(
      service.sendFriendRequest({ requesterId: "alice", addresseeId: "alice" }),
    ).rejects.toThrowError(/cannot add yourself/i);
  });

  it("accepts a friend request and creates reciprocal friendships", async () => {
    const service = createFriendshipService({ repository });
    const request = await service.sendFriendRequest({
      requesterId: "alice",
      addresseeId: "bob",
    });

    const accepted = await service.respondToFriendRequest({
      requestId: request.id,
      responderId: "bob",
      action: "accept",
    });

    expect(accepted?.status).toBe("accepted");

    const friendsOfBob = repository.listFriends("bob");
    const friendsOfAlice = repository.listFriends("alice");

    expect(friendsOfAlice).toHaveLength(1);
    expect(friendsOfAlice[0]?.friendId).toBe("bob");
    expect(friendsOfBob).toHaveLength(1);
    expect(friendsOfBob[0]?.friendId).toBe("alice");
  });

  it("declines a friend request without creating friendships", async () => {
    const service = createFriendshipService({ repository });
    const request = await service.sendFriendRequest({
      requesterId: "alice",
      addresseeId: "bob",
    });

    const declined = await service.respondToFriendRequest({
      requestId: request.id,
      responderId: "bob",
      action: "decline",
    });

    expect(declined?.status).toBe("declined");
    expect(repository.listFriends("alice")).toHaveLength(0);
    expect(repository.listFriends("bob")).toHaveLength(0);
  });

  it("guards against unauthorized responders", async () => {
    const service = createFriendshipService({ repository });
    const request = await service.sendFriendRequest({
      requesterId: "alice",
      addresseeId: "bob",
    });

    await expect(
      service.respondToFriendRequest({
        requestId: request.id,
        responderId: "charlie",
        action: "accept",
      }),
    ).rejects.toThrowError(/not authorized/i);
  });
});
