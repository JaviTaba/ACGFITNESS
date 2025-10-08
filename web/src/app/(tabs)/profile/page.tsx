import { getProfile } from "@/lib/api";
import {
  CalendarDays,
  Flame,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";

const DEMO_USER_ID = "demo-user";

export default async function ProfilePage() {
  const profile = await getProfile(DEMO_USER_ID);

  const formattedJoinDate = new Date(profile.joinDate).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <section className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {profile.displayName}
            </h1>
            <p className="text-sm text-foreground/60">@{profile.username}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/15 px-4 py-2 text-sm font-semibold text-brand">
            <Flame className="h-4 w-4" />
            {profile.streakDays} day streak
          </div>
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-surface-muted/60 p-4">
            <dt className="flex items-center gap-2 text-foreground/60">
              <CalendarDays className="h-4 w-4" />
              Joined on
            </dt>
            <dd className="mt-2 text-base font-semibold text-foreground">
              {formattedJoinDate}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/5 bg-surface-muted/60 p-4">
            <dt className="text-foreground/60">Active goals</dt>
            <dd className="mt-2 text-base font-semibold text-foreground">
              {profile.goals.length}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/5 bg-surface-muted/60 p-4">
            <dt className="text-foreground/60">Community badges</dt>
            <dd className="mt-2 text-base font-semibold text-foreground">
              {profile.badges.length}
            </dd>
          </div>
        </dl>
      </header>

      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Focus areas
            </h2>
            <p className="text-sm text-foreground/60">
              These are the habits you are reinforcing right now.
            </p>
          </div>
        </header>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {profile.goals.map((goal) => {
            const progressPercent = Math.round(Math.min(goal.progress, 1) * 100);
            return (
              <li
                key={goal.title}
                className="rounded-2xl border border-white/5 bg-surface-muted/60 p-5 shadow-inner shadow-black/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {goal.title}
                  </h3>
                  <span className="text-xs font-semibold text-brand">
                    {progressPercent}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-foreground/60">
                  Target: {goal.target}
                </p>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand via-brand-accent to-brand-purple"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Trophies</h2>
            <p className="text-sm text-foreground/60">
              Major milestones will unlock a trophy here. The shelf is ready for
              your next big win.
            </p>
          </div>
        </header>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-surface-muted/50 p-6 text-center shadow-inner shadow-black/20">
            <Trophy className="h-10 w-10 text-foreground/40" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Trophy case ready
            </p>
            <p className="mt-1 text-xs text-foreground/60">
              Keep training—unlocked trophies will automatically appear here.
            </p>
          </div>
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-surface-muted/40 p-6 text-center shadow-inner shadow-black/10">
            <Lock className="h-10 w-10 text-foreground/40" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Reserved slot
            </p>
            <p className="mt-1 text-xs text-foreground/60">
              Add future trophy concepts whenever inspiration strikes.
            </p>
          </div>
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-surface-muted/40 p-6 text-center shadow-inner shadow-black/10">
            <Sparkles className="h-10 w-10 text-brand" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Idea parking
            </p>
            <p className="mt-1 text-xs text-foreground/60">
              Drop placeholder notes for new achievements right here.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Earned badges
            </h2>
            <p className="text-sm text-foreground/60">
              Badges highlight the streaks and routines you are already proud
              of.
            </p>
          </div>
        </header>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.badges.map((badge) => (
            <article
              key={badge.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-surface-muted/60 p-5 shadow-inner shadow-black/10"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-purple/20 px-3 py-1 text-xs font-semibold text-brand-purple">
                <Sparkles className="h-4 w-4" />
                Badge unlocked
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {badge.label}
              </h3>
              <p className="text-xs leading-relaxed text-foreground/60">
                {badge.description}
              </p>
            </article>
          ))}
          {profile.badges.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-surface-muted/40 p-6 text-center text-sm text-foreground/60">
              No badges yet — complete habits to earn your first one.
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}
