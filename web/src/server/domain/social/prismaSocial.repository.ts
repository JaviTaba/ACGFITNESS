import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import {
  FriendGraph,
  PostAttachment,
  PostEntity,
  PostPrivacy,
  PostRepository,
} from "./social.service";

function mapPrivacy(value: Prisma.PostPrivacy): PostPrivacy {
  switch (value) {
    case "PUBLIC":
      return "public";
    case "PRIVATE":
      return "private";
    case "CLOSE_FRIENDS":
      return "close_friends";
    default:
      return "friends";
  }
}

type PostWithRelations = Prisma.PostGetPayload<{
  include: { attachments: true };
}> & {
  comments?: Array<{
    id: string;
    authorId: string;
    content: string;
    createdAt: Date;
  }>;
};

function mapPost(post: PostWithRelations): PostEntity {
  return {
    id: post.id,
    authorId: post.authorId,
    content: post.content,
    privacy: mapPrivacy(post.privacy),
    location: post.location,
    attachments: post.attachments.map((item) => ({
      kind: item.kind.toLowerCase() as PostAttachment["kind"],
      url: item.url,
      alt: item.alt,
    })),
    highFives: post.highFives,
    comments: (post.comments ?? [])
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((comment) => ({
        id: comment.id,
        authorId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt,
      })),
    createdAt: post.createdAt,
  };
}

function toPrismaPrivacy(privacy: PostPrivacy): Prisma.PostPrivacy {
  switch (privacy) {
    case "public":
      return "PUBLIC";
    case "private":
      return "PRIVATE";
    case "close_friends":
      return "CLOSE_FRIENDS";
    default:
      return "FRIENDS";
  }
}

function toPrismaAttachmentKind(
  kind: PostAttachment["kind"],
): Prisma.AttachmentKind {
  switch (kind) {
    case "video":
      return "VIDEO";
    case "link":
      return "LINK";
    default:
      return "IMAGE";
  }
}

export class PrismaPostRepository implements PostRepository {
  async createPost(
    payload: Omit<PostEntity, "id" | "createdAt">,
  ): Promise<PostEntity> {
    const created = await prisma.post.create({
      data: {
        authorId: payload.authorId,
        content: payload.content,
        privacy: toPrismaPrivacy(payload.privacy),
        location: payload.location,
        attachments: payload.attachments
          ? {
              create: payload.attachments.map((item) => ({
                kind: toPrismaAttachmentKind(item.kind),
                url: item.url,
                alt: item.alt,
              })),
            }
          : undefined,
      },
      include: {
        attachments: true,
        comments: true,
      },
    } as any);
    return mapPost(created as PostWithRelations);
  }

  async listPostsForUsers(userIds: string[]): Promise<PostEntity[]> {
    if (userIds.length === 0) {
      return [];
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: userIds },
      },
      include: {
        attachments: true,
        comments: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    } as any);

    return (posts as PostWithRelations[]).map(mapPost);
  }
}

export class PrismaFriendGraph implements FriendGraph {
  async listAcceptedFriendIds(userId: string): Promise<string[]> {
    const friendships = await prisma.friendship.findMany({
      where: { userId },
      select: { friendId: true },
    });
    return friendships.map((row) => row.friendId);
  }

  async listCloseFriendIds(userId: string): Promise<string[]> {
    const entries = await prisma.closeFriend.findMany({
      where: { userId },
      select: { friendId: true },
    });
    return entries.map((row) => row.friendId);
  }
}
