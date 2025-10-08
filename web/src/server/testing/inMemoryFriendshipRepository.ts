import { randomUUID } from "node:crypto";
import {
  FriendRequestEntity,
  FriendshipEntity,
  FriendshipRepository,
} from "@/server/domain/friendships/friendship.service";

export class InMemoryFriendshipRepository implements FriendshipRepository {
  private friendRequests = new Map<string, FriendRequestEntity>();
  private friendships = new Map<string, FriendshipEntity>();

  async findFriendRequestBetween(
    requesterId: string,
    addresseeId: string,
  ): Promise<FriendRequestEntity | null> {
    return (
      [...this.friendRequests.values()].find(
        (request) =>
          request.requesterId === requesterId &&
          request.addresseeId === addresseeId &&
          request.status === "pending",
      ) ?? null
    );
  }

  async getFriendRequestById(id: string): Promise<FriendRequestEntity | null> {
    return this.friendRequests.get(id) ?? null;
  }

  async createFriendRequest(
    data: Pick<
      FriendRequestEntity,
      "requesterId" | "addresseeId" | "message"
    >,
  ): Promise<FriendRequestEntity> {
    const record: FriendRequestEntity = {
      id: randomUUID(),
      requesterId: data.requesterId,
      addresseeId: data.addresseeId,
      message: data.message,
      status: "pending",
      createdAt: new Date(),
      respondedAt: null,
    };
    this.friendRequests.set(record.id, record);
    return record;
  }

  async updateFriendRequestStatus(
    id: string,
    status: FriendRequestEntity["status"],
  ): Promise<FriendRequestEntity | null> {
    const request = this.friendRequests.get(id);
    if (!request) {
      return null;
    }
    request.status = status;
    request.respondedAt = new Date();
    this.friendRequests.set(id, request);
    return request;
  }

  async createFriendshipPair(
    userId: string,
    friendId: string,
  ): Promise<[FriendshipEntity, FriendshipEntity]> {
    const first: FriendshipEntity = {
      id: randomUUID(),
      userId,
      friendId,
      createdAt: new Date(),
    };
    const second: FriendshipEntity = {
      id: randomUUID(),
      userId: friendId,
      friendId: userId,
      createdAt: new Date(),
    };
    this.friendships.set(first.id, first);
    this.friendships.set(second.id, second);
    return [first, second];
  }

  async areUsersAlreadyConnected(
    userId: string,
    friendId: string,
  ): Promise<boolean> {
    return (
      [...this.friendships.values()].find(
        (entry) => entry.userId === userId && entry.friendId === friendId,
      ) !== undefined
    );
  }

  listFriends(userId: string): FriendshipEntity[] {
    return [...this.friendships.values()].filter(
      (entry) => entry.userId === userId,
    );
  }

  clear() {
    this.friendRequests.clear();
    this.friendships.clear();
  }
}
