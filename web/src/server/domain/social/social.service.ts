import { z } from "zod";

export type PostPrivacy =
  | "friends"
  | "close_friends"
  | "private"
  | "public";

export interface PostAttachment {
  kind: "image" | "video" | "link";
  url: string;
  alt?: string | null;
}

<<<<<<< HEAD
export interface PostComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

=======
>>>>>>> aab1da3 (first version)
export interface PostEntity {
  id: string;
  authorId: string;
  content: string;
  privacy: PostPrivacy;
<<<<<<< HEAD
  location: string | null;
  attachments?: PostAttachment[];
  highFives: number;
  comments: PostComment[];
=======
  attachments?: PostAttachment[];
>>>>>>> aab1da3 (first version)
  createdAt: Date;
}

export interface PostRepository {
  createPost(payload: Omit<PostEntity, "id" | "createdAt">): Promise<PostEntity>;
  listPostsForUsers(userIds: string[]): Promise<PostEntity[]>;
}

export interface FriendGraph {
  listAcceptedFriendIds(userId: string): Promise<string[]>;
  listCloseFriendIds(userId: string): Promise<string[]>;
}

const attachmentSchema = z.object({
  kind: z.enum(["image", "video", "link"]),
  url: z.string().url(),
  alt: z.string().max(120).optional(),
});

const postSchema = z.object({
  authorId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, "Posts require at least one character.")
    .max(1000, "Posts cannot exceed 1000 characters."),
  privacy: z
    .enum(["friends", "close_friends", "private", "public"])
    .default("friends"),
  attachments: z.array(attachmentSchema).max(4).optional(),
<<<<<<< HEAD
  location: z
    .string()
    .trim()
    .max(120, "Locations must be under 120 characters.")
    .optional(),
=======
>>>>>>> aab1da3 (first version)
});

const feedSchema = z.object({
  userId: z.string().min(1),
});

export interface SocialService {
  publishPost(input: z.infer<typeof postSchema>): Promise<PostEntity>;
  getFriendFeed(
    input: z.infer<typeof feedSchema>,
  ): Promise<PostEntity[]>;
}

interface CreateSocialServiceDependencies {
  repository: PostRepository;
  friendGraph: FriendGraph;
}

export function createSocialService({
  repository,
  friendGraph,
}: CreateSocialServiceDependencies): SocialService {
  const publishPost: SocialService["publishPost"] = async (input) => {
    const payload = postSchema.parse(input);

    const prepared: Omit<PostEntity, "id" | "createdAt"> = {
<<<<<<< HEAD
      authorId: payload.authorId,
      content: payload.content.trim(),
      privacy: payload.privacy,
      location:
        payload.location && payload.location.length > 0
          ? payload.location
          : null,
=======
      ...payload,
      content: payload.content.trim(),
>>>>>>> aab1da3 (first version)
      attachments: payload.attachments?.map((item) => ({
        ...item,
        alt: item.alt?.trim() ?? null,
      })),
<<<<<<< HEAD
      highFives: 0,
      comments: [],
=======
>>>>>>> aab1da3 (first version)
    };

    return repository.createPost(prepared);
  };

  const getFriendFeed: SocialService["getFriendFeed"] = async (input) => {
    const payload = feedSchema.parse(input);
    const friendIds = await friendGraph.listAcceptedFriendIds(payload.userId);

    const friendSet = new Set(friendIds);
    const relevantIds = Array.from(
      new Set([payload.userId, ...friendIds]),
    );
    if (relevantIds.length === 0) {
      return [];
    }

    const closeFriendMatrix = new Map<string, Set<string>>();
    await Promise.all(
      relevantIds.map(async (authorId) => {
        const closeFriends = await friendGraph.listCloseFriendIds(authorId);
        closeFriendMatrix.set(authorId, new Set(closeFriends));
      }),
    );

    const posts = await repository.listPostsForUsers(relevantIds);
    return posts
      .filter((post) => {
        if (post.authorId === payload.userId) {
          return true;
        }

        switch (post.privacy) {
          case "public":
            return true;
          case "friends":
            return friendSet.has(post.authorId);
          case "close_friends":
            return (
              closeFriendMatrix
                .get(post.authorId)
                ?.has(payload.userId) ?? false
            );
          default:
            return false;
        }
      })
      .sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
  };

  return {
    publishPost,
    getFriendFeed,
  };
}
