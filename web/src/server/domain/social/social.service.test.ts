import { describe, it, expect, beforeEach } from "vitest";
import {
  createSocialService,
} from "./social.service";
import {
  InMemoryFriendGraph,
  InMemoryPostRepository,
} from "@/server/testing/inMemorySocialRepositories";

describe("socialService", () => {
  let posts: InMemoryPostRepository;
  let friends: InMemoryFriendGraph;

  beforeEach(() => {
    posts = new InMemoryPostRepository();
    friends = new InMemoryFriendGraph();
  });

  it("creates a formatted post slug for the feed", async () => {
    const service = createSocialService({
      repository: posts,
      friendGraph: friends,
    });

    const post = await service.publishPost({
      authorId: "alice",
      content: "  First ride complete!  ",
      privacy: "friends",
      attachments: [{ kind: "image", url: "https://example.com/ride.jpg" }],
      location: "  River Loop  ",
    });

    expect(post.id).toBeDefined();
    expect(post.content).toBe("First ride complete!");
    expect(post.location).toBe("River Loop");
    expect(post.highFives).toBe(0);
    expect(post.comments).toEqual([]);
  });

  it("returns the feed including accepted friends and self", async () => {
    const service = createSocialService({
      repository: posts,
      friendGraph: friends,
    });

    friends.connect("alice", "bob");

    await service.publishPost({
      authorId: "alice",
      content: "Alice progress",
      privacy: "friends",
    });
    await service.publishPost({
      authorId: "bob",
      content: "Bob update",
      privacy: "friends",
    });
    await service.publishPost({
      authorId: "charlie",
      content: "Charlie solo",
      privacy: "friends",
    });

    const feed = await service.getFriendFeed({ userId: "alice" });

    expect(feed.map((item) => item.authorId)).toEqual(["bob", "alice"]);
  });

  it("includes close friend posts when the author tagged the viewer", async () => {
    const service = createSocialService({
      repository: posts,
      friendGraph: friends,
    });

    friends.connect("alice", "bob");
    friends.markCloseFriend("bob", "alice");

    await service.publishPost({
      authorId: "bob",
      content: "Bob for close circle",
      privacy: "close_friends",
    });

    const feed = await service.getFriendFeed({ userId: "alice" });
    expect(feed).toHaveLength(1);
    expect(feed[0]?.content).toBe("Bob for close circle");
  });

  it("excludes close friend posts when the viewer is not tagged", async () => {
    const service = createSocialService({
      repository: posts,
      friendGraph: friends,
    });

    friends.connect("alice", "bob");

    await service.publishPost({
      authorId: "bob",
      content: "Bob general",
      privacy: "friends",
    });
    await service.publishPost({
      authorId: "bob",
      content: "Bob inner circle",
      privacy: "close_friends",
    });

    const feed = await service.getFriendFeed({ userId: "alice" });

    expect(feed).toHaveLength(1);
    expect(feed[0]?.content).toBe("Bob general");
  });

  it("excludes private posts when privacy is owner", async () => {
    const service = createSocialService({
      repository: posts,
      friendGraph: friends,
    });

    friends.connect("alice", "bob");

    await service.publishPost({
      authorId: "bob",
      content: "Bob public",
      privacy: "friends",
    });

    await service.publishPost({
      authorId: "bob",
      content: "Bob private",
      privacy: "private",
    });

    const feed = await service.getFriendFeed({ userId: "alice" });
    expect(feed).toHaveLength(1);
    expect(feed[0]?.content).toBe("Bob public");
  });
});
