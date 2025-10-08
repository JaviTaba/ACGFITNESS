import { NextResponse } from "next/server";
import { ZodError } from "zod";
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

export function buildPostHandlers(
  dependencies: HandlerDependencies = {},
) {
  const socialService =
    dependencies.socialService ??
    createSocialService({
      repository: new PrismaPostRepository(),
      friendGraph: new PrismaFriendGraph(),
    });

  const POST = async (request: Request) => {
    try {
      const body = await request.json();
      const result = await socialService.publishPost(body);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: `Validation error: ${error.message}` },
          { status: 400 },
        );
      }
      console.error("Unexpected error publishing post", error);
      return NextResponse.json(
        { error: "Unexpected error publishing post." },
        { status: 500 },
      );
    }
  };

  return { POST };
}

export const { POST } = buildPostHandlers();
