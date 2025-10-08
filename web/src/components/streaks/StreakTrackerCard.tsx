"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type {
  StreakCelebration,
  StreakGoalSummary,
  StreakSummary as StreakSummaryBase,
} from "@/server/domain/tracking/streak.service";

type NormalizedGoal = Omit<StreakGoalSummary, "achievedAt"> & {
  achievedAt?: Date;
};

type NormalizedCelebration = Omit<StreakCelebration, "unlockedAt"> & {
  unlockedAt: Date;
};

export type NormalizedStreakSummary = Omit<
  StreakSummaryBase,
  "today" | "lastActivityDate" | "recentActivity" | "goals" | "nextGoal" | "celebration"
> & {
  today: Date;
  lastActivityDate?: Date;
  recentActivity: Array<{ date: Date; logged: boolean }>;
  goals: NormalizedGoal[];
  nextGoal?: NormalizedGoal;
  celebration?: NormalizedCelebration;
};

interface StreakTrackerCardProps {
  streak: NormalizedStreakSummary;
  userId: string;
}

export function StreakTrackerCard({ streak, userId }: StreakTrackerCardProps) {
  const [showCelebration, setShowCelebration] = useState(
    Boolean(streak.celebration),
  );
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (streak.celebration) {
      setShowCelebration(true);
    }
  }, [streak.celebration?.milestoneId]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
      }),
    [],
  );
  const weekdayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
      }),
    [],
  );

  const nextGoal =
    streak.nextGoal ?? streak.goals.find((goal) => !goal.achieved);
  const progressPercent = nextGoal
    ? Math.min(
        100,
        Math.round((streak.currentStreak / nextGoal.targetDays) * 100),
      )
    : 100;

  const sameDay = (a: Date, b: Date) =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();

  const loggedToday =
    streak.lastActivityDate &&
    sameDay(streak.lastActivityDate, streak.today);

  const lastLoggedCopy = !streak.lastActivityDate
    ? "Log today to ignite your first streak."
    : loggedToday
      ? "Logged today. Keep the momentum!"
      : `Last logged on ${dateFormatter.format(streak.lastActivityDate)}.`;

  const shareMessage =
    streak.celebration?.suggestedCaption ??
    `Just completed a ${streak.currentStreak}-day streak on ACOGO Fitness!`;

  return (
    <>
      <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-brand">
                Streaks
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">
                  {streak.currentStreak}
                </span>
                <span className="text-sm text-foreground/60">
                  {streak.currentStreak === 1 ? "day active" : "days active"}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground/70">
                {lastLoggedCopy}
              </p>
              <p className="mt-2 text-xs text-foreground/60">
                Longest streak:{" "}
                <span className="font-semibold text-foreground">
                  {streak.longestStreak}{" "}
                  {streak.longestStreak === 1 ? "day" : "days"}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShareOpen(true);
                setShowCelebration(false);
              }}
              className="inline-flex items-center justify-center rounded-full border border-brand/20 bg-brand px-4 py-2 text-sm font-semibold text-background shadow-md shadow-brand/30 transition hover:bg-brand/90"
            >
              Share streak
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-foreground/60">
              <span>Next goal</span>
              <span>
                {nextGoal
                  ? `${streak.currentStreak}/${nextGoal.targetDays} days`
                  : "All goals completed"}
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {nextGoal ? (
              <p className="mt-2 text-xs text-foreground/70">
                {nextGoal.label} · {nextGoal.description}
              </p>
            ) : (
              <p className="mt-2 text-xs text-foreground/70">
                You have unlocked every streak milestone. Time to set new ones!
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-foreground/50">
              <span>Recent days</span>
              <span>Today</span>
            </div>
            <div className="mt-3 grid grid-cols-14 gap-1">
              {streak.recentActivity.map((day) => {
                const isToday = sameDay(day.date, streak.today);
                const label = `${weekdayFormatter.format(day.date)} · ${dateFormatter.format(day.date)}`;
                return (
                  <span
                    key={day.date.getTime()}
                    title={label}
                    className={clsx(
                      "flex h-8 w-full items-center justify-center rounded-full text-[10px] font-semibold uppercase",
                      day.logged
                        ? "bg-brand/80 text-background"
                        : "border border-white/10 bg-white/5 text-foreground/30",
                      isToday && "ring-2 ring-brand/60",
                    )}
                  >
                    {weekdayFormatter
                      .format(day.date)
                      .slice(0, 1)}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-surface-muted/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
              Milestones
            </p>
            <ul className="mt-3 space-y-2">
              {streak.goals.map((goal) => {
                const achieved = goal.achieved;
                const statusLabel = achieved
                  ? goal.achievedAt
                    ? `Unlocked ${dateFormatter.format(goal.achievedAt)}`
                    : "Unlocked"
                  : `${Math.min(streak.currentStreak, goal.targetDays)}/${goal.targetDays} days`;
                return (
                  <li
                    key={goal.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-surface px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {goal.label}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {statusLabel}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        "rounded-full px-3 py-1 text-xs font-semibold transition",
                        achieved
                          ? "bg-brand/20 text-brand"
                          : "bg-white/5 text-foreground/50",
                      )}
                    >
                      {achieved ? "Unlocked" : "In progress"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <CelebrationModal
        open={showCelebration && Boolean(streak.celebration)}
        celebration={streak.celebration}
        onClose={() => setShowCelebration(false)}
        onShare={() => {
          setShowCelebration(false);
          setShareOpen(true);
        }}
      />
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        onSuccess={() => setShareOpen(false)}
        defaultMessage={shareMessage}
        userId={userId}
      />
    </>
  );
}

interface CelebrationModalProps {
  open: boolean;
  celebration?: NormalizedCelebration;
  onClose: () => void;
  onShare: () => void;
}

function CelebrationModal({
  open,
  celebration,
  onClose,
  onShare,
}: CelebrationModalProps) {
  if (!open || !celebration) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-3xl border border-brand/30 bg-surface shadow-2xl shadow-brand/40">
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-2xl text-background">
              🎉
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {celebration.headline}
              </h3>
              <p className="mt-1 text-sm text-foreground/70">
                {celebration.message}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface-muted/60 p-4 text-sm text-foreground/70">
            <p>
              Make it official—share your streak so everyone can see the work
              you&apos;re putting in. Add a photo or a quick note to inspire the
              crew.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-foreground/70 transition hover:border-white/40 hover:text-foreground"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-background shadow shadow-brand/40 transition hover:bg-brand/90"
            >
              Share with everyone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMessage: string;
  userId: string;
}

function ShareModal({
  open,
  onClose,
  onSuccess,
  defaultMessage,
  userId,
}: ShareModalProps) {
  const [message, setMessage] = useState(defaultMessage);
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMessage(defaultMessage);
      setImageUrl("");
      setStatus("idle");
      setError(null);
    }
  }, [open, defaultMessage]);

  if (!open) {
    return null;
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    if (status === "submitting") {
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setError("Add a quick note so friends know what you achieved.");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const preparedImageUrl = imageUrl.trim();
      const attachments =
        preparedImageUrl.length > 0
          ? [
              {
                kind: "image" as const,
                url: preparedImageUrl,
                alt: "Streak celebration photo",
              },
            ]
          : undefined;

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: userId,
          content: trimmedMessage,
          privacy: "public",
          attachments,
        }),
      });

      if (!response.ok) {
        throw new Error(`Share failed with status ${response.status}`);
      }

      setStatus("success");
      onSuccess();
    } catch (err) {
      console.error("Failed to share streak", err);
      setStatus("error");
      setError(
        "We couldn’t share that right now. Try again in a moment.",
      );
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-surface shadow-2xl shadow-black/40">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <header>
            <h3 className="text-lg font-semibold text-foreground">
              Share your streak
            </h3>
            <p className="mt-1 text-sm text-foreground/60">
              Everyone can see it. Add a caption and optionally drop a hosted
              photo link to mark the moment.
            </p>
          </header>
          <label className="flex flex-col gap-2 text-sm text-foreground/70">
            Caption
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="rounded-2xl border border-white/15 bg-surface-muted/60 p-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
              placeholder="How did you keep the streak alive?"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-foreground/70">
            Optional image URL
            <input
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://"
              className="rounded-full border border-white/15 bg-surface-muted/60 px-4 py-2 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
            />
            <span className="text-xs text-foreground/50">
              Use a publicly accessible image link. Upload support is coming
              soon.
            </span>
          </label>
          {error ? (
            <p className="text-sm font-medium text-brand">{error}</p>
          ) : status === "success" ? (
            <p className="text-sm font-medium text-brand">
              Shared! Your streak is on the feed.
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-foreground/70 transition hover:border-white/40 hover:text-foreground"
              disabled={status === "submitting"}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={clsx(
                "inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-background shadow shadow-brand/40 transition",
                status === "submitting"
                  ? "opacity-70"
                  : "hover:bg-brand/90",
              )}
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Sharing…" : "Share publicly"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
