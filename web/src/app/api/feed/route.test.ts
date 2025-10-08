import { describe, expect, it, beforeEach } from "vitest";
import { buildFeedHandlers } from "./route";
import {
  InMemoryFriendGraph,
  InMemoryPostRepository,
} from "@/server/testing/inMemorySocialRepositories";
import { createSocialService } from "@/server/domain/social/social.service";

describe("GET /api/feed", () => {
  let posts: InMemoryPostRepository;
  let graph: InMemoryFriendGraph;

  beforeEach(() => {
    posts = new InMemoryPostRepository();
    graph = new InMemoryFriendGraph();
  });

  it("returns posts for user and friends", async () => {
    graph.connect("alice", "bob");
    const socialService = createSocialService({
      repository: posts,
      friendGraph: graph,
    });

    await socialService.publishPost({
      authorId: "alice",
      content: "Alice entry",
      privacy: "friends",
    });
    await socialService.publishPost({
      authorId: "bob",
      content: "Bob entry",
      privacy: "friends",
    });
    await socialService.publishPost({
      authorId: "charlie",
      content: "Charlie entry",
      privacy: "friends",
    });

    const { GET } = buildFeedHandlers({ socialService });

    const response = await GET(
      new Request("http://localhost/api/feed?userId=alice"),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.posts).toHaveLength(2);
    expect(json.posts.map((item: { authorId: string }) => item.authorId)).toEqual([
      "bob",
      "alice",
    ]);
  });

  it("validates userId", async () => {
    const { GET } = buildFeedHandlers({
      socialService: createSocialService({
        repository: posts,
        friendGraph: graph,
      }),
    });
    const response = await GET(new Request("http://localhost/api/feed"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        error: expect.stringContaining("userId is required"),
      }),
    );
  });
});
