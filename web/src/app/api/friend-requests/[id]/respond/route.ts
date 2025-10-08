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

export function buildFriendRequestResponseHandlers(
  { repository = new PrismaFriendshipRepository() }: HandlerDependencies = {},
) {
  const service = createFriendshipService({ repository });

  const POST = async (
    request: Request,
    { params }: { params: { id: string } },
  ) => {
    try {
      const body = await request.json();
      const action = body?.action;
      const responderId = body?.responderId;
      if (!action || !responderId) {
        return NextResponse.json(
          { error: "action and responderId are required." },
          { status: 400 },
        );
      }

      const response = await service.respondToFriendRequest({
        requestId: params.id,
        action,
        responderId,
      });

      if (!response) {
        return NextResponse.json(
          { error: "Friend request not found." },
          { status: 404 },
        );
      }

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      if (error instanceof DomainError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 },
        );
      }
      console.error("Failed to respond to friend request", error);
      return NextResponse.json(
        { error: "Unexpected error responding to request." },
        { status: 500 },
      );
    }
  };

  return { POST };
}

export const { POST } = buildFriendRequestResponseHandlers();
