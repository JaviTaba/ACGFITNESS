import {
  FriendRequestStatus as PrismaFriendRequestStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/server/db/client";
import {
  FriendRequestEntity,
  FriendshipEntity,
  FriendshipRepository,
} from "./friendship.service";

function mapFriendRequest(
  request: Prisma.FriendRequestGetPayload<object>,
): FriendRequestEntity {
  return {
    id: request.id,
    requesterId: request.requesterId,
    addresseeId: request.addresseeId,
    message: request.message,
    status: request.status.toLowerCase() as FriendRequestEntity["status"],
    createdAt: request.createdAt,
    respondedAt: request.respondedAt ?? null,
  };
}

function mapFriendship(
  friendship: Prisma.FriendshipGetPayload<object>,
): FriendshipEntity {
  return {
    id: friendship.id,
    userId: friendship.userId,
    friendId: friendship.friendId,
    createdAt: friendship.createdAt,
  };
}

export class PrismaFriendshipRepository implements FriendshipRepository {
  async findFriendRequestBetween(
    requesterId: string,
    addresseeId: string,
  ): Promise<FriendRequestEntity | null> {
    const result = await prisma.friendRequest.findFirst({
      where: {
        requesterId,
        addresseeId,
        status: PrismaFriendRequestStatus.PENDING,
      },
    });
    return result ? mapFriendRequest(result) : null;
  }

  async getFriendRequestById(id: string): Promise<FriendRequestEntity | null> {
    const result = await prisma.friendRequest.findUnique({
      where: { id },
    });
    return result ? mapFriendRequest(result) : null;
  }

  async createFriendRequest(
    data: Pick<
      FriendRequestEntity,
      "requesterId" | "addresseeId" | "message"
    >,
  ): Promise<FriendRequestEntity> {
    const created = await prisma.friendRequest.create({
      data: {
        requesterId: data.requesterId,
        addresseeId: data.addresseeId,
        message: data.message,
      },
    });
    return mapFriendRequest(created);
  }

  async updateFriendRequestStatus(
    id: string,
    status: FriendRequestEntity["status"],
  ): Promise<FriendRequestEntity | null> {
    const updated = await prisma.friendRequest.update({
      where: { id },
      data: {
        status:
          status === "pending"
            ? PrismaFriendRequestStatus.PENDING
            : status === "accepted"
              ? PrismaFriendRequestStatus.ACCEPTED
              : PrismaFriendRequestStatus.DECLINED,
        respondedAt:
          status === "pending" ? null : new Date(),
      },
    });
    return mapFriendRequest(updated);
  }

  async createFriendshipPair(
    userId: string,
    friendId: string,
  ): Promise<[FriendshipEntity, FriendshipEntity]> {
    const [first, second] = await prisma.$transaction([
      prisma.friendship.upsert({
        where: {
          userId_friendId: { userId, friendId },
        },
        create: {
          userId,
          friendId,
        },
        update: {},
      }),
      prisma.friendship.upsert({
        where: {
          userId_friendId: { userId: friendId, friendId: userId },
        },
        create: {
          userId: friendId,
          friendId: userId,
        },
        update: {},
      }),
    ]);
    return [mapFriendship(first), mapFriendship(second)];
  }

  async areUsersAlreadyConnected(
    userId: string,
    friendId: string,
  ): Promise<boolean> {
    const existing = await prisma.friendship.findUnique({
      where: {
        userId_friendId: { userId, friendId },
      },
    });
    return Boolean(existing);
  }
}
