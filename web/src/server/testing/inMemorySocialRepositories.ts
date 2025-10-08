import { randomUUID } from "node:crypto";
import {
  FriendGraph,
  PostEntity,
  PostRepository,
} from "@/server/domain/social/social.service";

export class InMemoryPostRepository implements PostRepository {
  private posts = new Map<string, PostEntity>();
  private counter = 0;

  async createPost(
    payload: Omit<PostEntity, "id" | "createdAt">,
  ): Promise<PostEntity> {
    const record: PostEntity = {
      id: randomUUID(),
      createdAt: new Date(Date.now() + this.counter++),
      ...payload,
      attachments: payload.attachments?.map((item) => ({ ...item })),
      comments: payload.comments.map((comment) => ({ ...comment })),
    };
    this.posts.set(record.id, record);
    return record;
  }

  async listPostsForUsers(userIds: string[]): Promise<PostEntity[]> {
    const userSet = new Set(userIds);
    return [...this.posts.values()]
      .filter((post) => userSet.has(post.authorId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export class InMemoryFriendGraph implements FriendGraph {
  private store = new Map<string, Set<string>>();
  private closeFriends = new Map<string, Set<string>>();

  connect(a: string, b: string) {
    if (!this.store.has(a)) this.store.set(a, new Set());
    if (!this.store.has(b)) this.store.set(b, new Set());
    this.store.get(a)?.add(b);
    this.store.get(b)?.add(a);
  }

  markCloseFriend(ownerId: string, friendId: string) {
    if (!this.closeFriends.has(ownerId)) {
      this.closeFriends.set(ownerId, new Set());
    }
    this.closeFriends.get(ownerId)?.add(friendId);
  }

  async listAcceptedFriendIds(userId: string): Promise<string[]> {
    return [...(this.store.get(userId) ?? [])];
  }

  async listCloseFriendIds(userId: string): Promise<string[]> {
    return [...(this.closeFriends.get(userId) ?? [])];
  }
}
