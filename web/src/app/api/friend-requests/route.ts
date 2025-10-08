import { NextResponse } from "next/server";
import {
  createFriendshipService,
  DomainError,
  FriendshipRepository,
} from "@/server/domain/friendships/friendship.service";
import { PrismaFriendshipRepository } from "@/server/domain/friendships/prismaFriendship.repository";

interface HandlerDependencies {
  repository?: FriendshipRepository;
}

export function buildFriendRequestHandlers(
  { repository = new PrismaFriendshipRepository() }: HandlerDependencies = {},
) {
  const service = createFriendshipService({ repository });

  const POST = async (request: Request) => {
    try {
      const body = await request.json();
      const requesterId = body?.requesterId;
      const addresseeId = body?.addresseeId;
      const message = body?.message;

      if (!requesterId || !addresseeId) {
        return NextResponse.json(
          { error: "requesterId and addresseeId are required." },
          { status: 400 },
        );
      }

      const result = await service.sendFriendRequest({
        requesterId,
        addresseeId,
        message,
      });

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof DomainError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 },
        );
      }

      console.error("Failed to create friend request", error);
      return NextResponse.json(
        { error: "Unexpected error creating friend request." },
        { status: 500 },
      );
    }
  };

  return { POST };
}

export const { POST } = buildFriendRequestHandlers();
