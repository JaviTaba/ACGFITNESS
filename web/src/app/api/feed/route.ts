import { NextResponse } from "next/server";
import {
  createSocialService,
  SocialService,
} from "@/server/domain/social/social.service";
import {
  PrismaFriendGraph,
  PrismaPostRepository,
} from "@/server/domain/social/prismaSocial.repository";

interface HandlerDependencies {
  socialService?: SocialService;
}

export function buildFeedHandlers(
  dependencies: HandlerDependencies = {},
) {
  const socialService =
    dependencies.socialService ??
    createSocialService({
      repository: new PrismaPostRepository(),
      friendGraph: new PrismaFriendGraph(),
    });

  const GET = async (request: Request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    try {
      const posts = await socialService.getFriendFeed({ userId });
      return NextResponse.json({ posts }, { status: 200 });
    } catch (error) {
      console.error("Failed to load feed", error);
      return NextResponse.json(
        { error: "Unexpected error loading feed." },
        { status: 500 },
      );
    }
  };

  return { GET };
}

export const { GET } = buildFeedHandlers();
