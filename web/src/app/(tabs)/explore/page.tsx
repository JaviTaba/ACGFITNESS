import Image from "next/image";
import Link from "next/link";
import { getFeed } from "@/lib/api";
import { demoProfile } from "@/lib/demo-data";
import {
  Lock,
  Users,
  Search,
  Sparkles,
} from "lucide-react";

const DEMO_USER_ID = "demo-user";

const FRIEND_PREVIEWS = [
  {
    id: "marie-l",
    name: "Marie Laurent",
    specialty: "Mobility + yoga",
    mutualFriends: 4,
  },
  {
    id: "david-r",
    name: "David Ritchie",
    specialty: "Endurance",
    mutualFriends: 2,
  },
  {
    id: "heather-b",
    name: "Heather Bowen",
    specialty: "Strength training",
    mutualFriends: 3,
  },
];

export default async function ExplorePage() {
  const posts = await getFeed(DEMO_USER_ID);
  const normalizedPosts = posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt),
  }));

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-brand/15 p-3 text-brand">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Find real training partners
            </h2>
            <p className="text-sm text-foreground/60">
              Each request is mutual. Preview a profile snapshot before you
              reach out.
            </p>
          </div>
        </div>
        <form className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-surface-muted/80 px-4 py-3 focus-within:border-brand focus-within:shadow-lg focus-within:shadow-brand/20">
          <Search className="h-4 w-4 text-foreground/50" />
          <input
            type="search"
            placeholder="Search by username or email"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/50 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-background shadow-md shadow-brand/40"
          >
            Find
          </button>
        </form>
      </div>

      <section className="grid gap-4 md:grid-cols-[2fr,minmax(0,1fr)]">
        <div className="space-y-4">
          {normalizedPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-lg shadow-black/30 backdrop-blur"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-brand/15 ring-2 ring-brand/20" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {toDisplayName(post.authorId)}
                    </p>
                    <span className="text-xs text-foreground/60">
                      @{post.authorId}
                    </span>
                  </div>
                </div>
                <PrivacyBadge privacy={post.privacy} />
              </header>
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                {post.content}
              </p>
              {post.attachments && post.attachments.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={post.attachments[0]!.url}
                    alt={post.attachments[0]!.alt ?? "Post attachment"}
                    width={640}
                    height={360}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              <footer className="mt-4 flex items-center justify-between text-xs text-foreground/50">
                <span>
                  {post.createdAt.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <button className="rounded-full bg-brand/15 px-3 py-1 font-semibold text-brand transition hover:bg-brand/25">
                  Say congrats
                </button>
              </footer>
            </article>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-brand-purple/20 p-3 text-brand-purple">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Profile snapshot
                </h3>
                <p className="text-xs text-foreground/60">
                  Shared with people who search your username.
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-foreground/60">Name</dt>
                <dd className="font-semibold text-foreground">
                  {demoProfile.displayName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/60">Joined</dt>
                <dd className="font-semibold text-foreground">
                  {new Date(demoProfile.joinDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/60">Streak</dt>
                <dd className="font-semibold text-foreground">
                  {demoProfile.streakDays} days
                </dd>
              </div>
            </dl>
            <Link
              href="/profile"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
            >
              View full profile
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
            <h3 className="text-sm font-semibold text-foreground">
              People you may know
            </h3>
            <ul className="mt-4 space-y-3">
              {FRIEND_PREVIEWS.map((friend) => (
                <li
                  key={friend.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-surface-muted/60 px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {friend.name}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {friend.specialty} • {friend.mutualFriends} mutual friends
                    </p>
                  </div>
                  <button className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand transition hover:bg-brand/25">
                    Preview
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </section>
  );
}

function PrivacyBadge({ privacy }: { privacy: string }) {
  switch (privacy) {
    case "public":
      return (
        <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
          Public
        </span>
      );
    case "close_friends":
      return (
        <span className="flex items-center gap-1 rounded-full bg-brand-purple/20 px-3 py-1 text-xs font-semibold text-brand-purple">
          <Lock className="h-3.5 w-3.5" />
          Close friends
        </span>
      );
    default:
      return (
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-foreground/70">
          Friends only
        </span>
      );
  }
}

function toDisplayName(authorId: string) {
  return authorId
    .replace(/[-_]/g, " ")
    .split(" ")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
