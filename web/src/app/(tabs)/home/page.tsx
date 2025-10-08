'use client';

import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StreakTrackerCard,
  type NormalizedStreakSummary,
} from "@/components/streaks/StreakTrackerCard";
import { demoStreak } from "@/lib/demo-data";
import type { StreakSummary } from "@/server/domain/tracking/streak.service";

type MetricOption = {
  value: string;
  label: string;
  defaultUnit: string;
  placeholder: string;
};

const metricOptions: MetricOption[] = [
  {
    value: "weight",
    label: "Weight Lifted",
    defaultUnit: "kg",
    placeholder: "e.g. 180",
  },
  {
    value: "time",
    label: "Time Completed",
    defaultUnit: "sec",
    placeholder: "e.g. 45.6",
  },
  {
    value: "distance",
    label: "Distance Covered",
    defaultUnit: "km",
    placeholder: "e.g. 5",
  },
  {
    value: "reps",
    label: "Repetitions",
    defaultUnit: "reps",
    placeholder: "e.g. 12",
  },
];

type PersonalRecord = {
  activity: string;
  metric: string;
  value: number;
  unit: string;
  notes?: string;
  loggedAt: string;
};

function normalizeStreak(input: StreakSummary): NormalizedStreakSummary {
  const toDate = (value?: string | Date | null) =>
    value ? new Date(value) : undefined;

  return {
    ...input,
    today: new Date(input.today),
    lastActivityDate: toDate(input.lastActivityDate),
    recentActivity: input.recentActivity.map((entry) => ({
      date: new Date(entry.date),
      logged: entry.logged,
    })),
    goals: input.goals.map((goal) => ({
      ...goal,
      achievedAt: toDate(goal.achievedAt),
    })),
    nextGoal: input.nextGoal
      ? {
          ...input.nextGoal,
          achievedAt: toDate(input.nextGoal.achievedAt),
        }
      : undefined,
    celebration: input.celebration
      ? {
          ...input.celebration,
          unlockedAt: new Date(input.celebration.unlockedAt),
        }
      : undefined,
  };
}

const DEMO_USER_ID = "demo-user";

export default function HomePage() {
  const [formState, setFormState] = useState(() => {
    const primaryMetric = metricOptions[0];
    return {
      activity: "",
      metric: primaryMetric?.value ?? "weight",
      value: "",
      unit: primaryMetric?.defaultUnit ?? "",
      notes: "",
      loggedAt: new Date().toISOString().slice(0, 10),
    };
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [celebrationRecord, setCelebrationRecord] =
    useState<PersonalRecord | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [shareComment, setShareComment] = useState("");
  const [shareStatus, setShareStatus] = useState<"idle" | "shared">("idle");
  const [shareImagePreview, setShareImagePreview] = useState<string | null>(
    null,
  );
  const [streakSummary, setStreakSummary] =
    useState<NormalizedStreakSummary>(() => normalizeStreak(demoStreak));
  const [streakLoading, setStreakLoading] = useState(false);
  const [streakError, setStreakError] = useState<string | null>(null);
  const shareTimeoutRef = useRef<number | null>(null);

  const activeMetric = useMemo(() => {
    return (
      metricOptions.find((option) => option.value === formState.metric) ??
      metricOptions[0]
    );
  }, [formState.metric]);

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) {
        clearTimeout(shareTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (shareImagePreview) {
        URL.revokeObjectURL(shareImagePreview);
      }
    };
  }, [shareImagePreview]);

  useEffect(() => {
    let cancelled = false;

    async function loadStreak() {
      if (process.env.NODE_ENV === "test") {
        return;
      }

      try {
        setStreakLoading(true);
        setStreakError(null);
        const origin =
          typeof window !== "undefined" && window.location?.origin
            ? window.location.origin
            : "http://localhost";
        const dashboardUrl = new URL("/api/dashboard", origin);
        dashboardUrl.searchParams.set("userId", DEMO_USER_ID);

        const response = await fetch(dashboardUrl, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Dashboard request failed (${response.status})`);
        }

        const payload = (await response.json()) as {
          streak?: StreakSummary;
        };

        if (!payload.streak) {
          throw new Error("Streak payload missing from dashboard response.");
        }

        if (!cancelled) {
          setStreakSummary(normalizeStreak(payload.streak));
        }
      } catch (error) {
        console.error("Failed to refresh streak summary", error);
        if (!cancelled) {
          setStreakError(
            "We couldn't refresh your streak right now. Showing stored progress.",
          );
        }
      } finally {
        if (!cancelled) {
          setStreakLoading(false);
        }
      }
    }

    void loadStreak();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange =
    (field: keyof typeof formState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleMetricChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextMetric = event.target.value;
    const match = metricOptions.find((option) => option.value === nextMetric);
    setFormState((prev) => ({
      ...prev,
      metric: nextMetric,
      unit: match?.defaultUnit ?? prev.unit,
    }));
  };

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }
    setFormState((prev) => ({
      ...prev,
      value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setShareStatus("idle");
    if (shareImagePreview) {
      URL.revokeObjectURL(shareImagePreview);
      setShareImagePreview(null);
    }
    if (!file) {
      return;
    }
    const preview = URL.createObjectURL(file);
    setShareImagePreview(preview);
  };

  const resetCelebrateState = () => {
    setIsCelebrating(false);
    setCelebrationRecord(null);
    setShareComment("");
    setShareStatus("idle");
    if (shareTimeoutRef.current) {
      clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = null;
    }
    if (shareImagePreview) {
      URL.revokeObjectURL(shareImagePreview);
      setShareImagePreview(null);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericValue = Number.parseFloat(formState.value);
    if (!formState.activity.trim()) {
      setFormError("Please describe the lift, workout, or achievement.");
      return;
    }
    if (!Number.isFinite(numericValue)) {
      setFormError("Add a number so we know how big this record was!");
      return;
    }
    if (!formState.unit.trim()) {
      setFormError("Every record needs a unit (kg, reps, seconds...).");
      return;
    }

    const record: PersonalRecord = {
      activity: formState.activity.trim(),
      metric: formState.metric,
      value: numericValue,
      unit: formState.unit.trim(),
      notes: formState.notes?.trim() ? formState.notes.trim() : undefined,
      loggedAt: formState.loggedAt,
    };

    setCelebrationRecord(record);
    setIsCelebrating(true);
    setFormError(null);
    setShareComment("");
    setShareStatus("idle");
    if (shareImagePreview) {
      URL.revokeObjectURL(shareImagePreview);
    }
    setShareImagePreview(null);

    setFormState((prev) => ({
      activity: "",
      metric: prev.metric,
      value: "",
      unit: prev.unit,
      notes: "",
      loggedAt: new Date().toISOString().slice(0, 10),
    }));
  };

  const handleShare = () => {
    setShareStatus("shared");
    shareTimeoutRef.current = window.setTimeout(() => {
      resetCelebrateState();
    }, 1600);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-20">
      <div className="space-y-2">
        <StreakTrackerCard streak={streakSummary} userId={DEMO_USER_ID} />
        {streakLoading ? (
          <p className="text-xs text-foreground/60">
            Refreshing your streak insights...
          </p>
        ) : null}
        {streakError ? (
          <p className="text-xs font-medium text-brand-accent">{streakError}</p>
        ) : null}
      </div>
      <section className="rounded-[36px] border border-white/10 bg-surface/70 px-8 py-10 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <header className="mb-8 flex flex-col gap-3 text-center md:text-left">
          <span className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-brand/40 bg-brand/10 px-4 py-1 text-sm font-medium uppercase tracking-[0.3em] text-brand md:self-start">
            Personal Record Log
          </span>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            Log a brand-new PR and celebrate the win 🏆
          </h1>
          <p className="text-sm text-foreground/80 md:text-base">
            Capture the details of your achievement. We&apos;ll cheer loudly and
            help you share the moment with your crew.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-3xl bg-surface-muted/70 p-6 ring-1 ring-black/20"
        >
          <div className="grid gap-6 sm:grid-cols-[1.4fr_0.6fr]">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-brand/90">
                What did you conquer?
              </span>
              <input
                value={formState.activity}
                onChange={handleChange("activity")}
                placeholder="Deadlift, Fran, 5k run..."
                className="rounded-2xl border border-white/10 bg-brand-dark/20 px-4 py-3 text-base text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
                required
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-brand/90">
                Metric
              </span>
              <select
                value={formState.metric}
                onChange={handleMetricChange}
                className="rounded-2xl border border-white/10 bg-brand-dark/20 px-4 py-3 text-base text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
              >
                {metricOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-brand/90">
                Record value
              </span>
              <div className="flex items-center gap-3">
                <input
                  value={formState.value}
                  onChange={handleValueChange}
                  inputMode="decimal"
                  placeholder={activeMetric?.placeholder}
                  className="flex-1 rounded-2xl border border-white/10 bg-brand-dark/20 px-4 py-3 text-base text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
                  required
                />
                <input
                  value={formState.unit}
                  onChange={handleChange("unit")}
                  placeholder={activeMetric?.defaultUnit}
                  className="w-28 rounded-2xl border border-white/10 bg-brand-dark/20 px-4 py-3 text-base text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
                  required
                />
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-brand/90">
                Logged on
              </span>
              <input
                type="date"
                value={formState.loggedAt}
                onChange={handleChange("loggedAt")}
                max={new Date().toISOString().slice(0, 10)}
                className="rounded-2xl border border-white/10 bg-brand-dark/20 px-4 py-3 text-base text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
                required
              />
            </label>
          </div>

  <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand/90">
              Notes (optional pep talk for future you)
            </span>
            <textarea
              value={formState.notes}
              onChange={handleChange("notes")}
              rows={4}
              placeholder="Hit this with perfect form after focusing on tempo work..."
              className="rounded-2xl border border-white/10 bg-brand-dark/20 px-4 py-3 text-base text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
            />
          </label>

          {formError ? (
            <p className="rounded-2xl border border-brand-accent/30 bg-brand-accent/10 px-4 py-3 text-sm text-brand-accent">
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-brand-accent to-brand-purple px-6 py-3 text-lg font-semibold text-brand-dark transition hover:opacity-90 active:translate-y-px"
          >
            Log personal record
            <span
              aria-hidden
              className="translate-y-1 text-2xl transition group-hover:scale-110"
            >
              🎉
            </span>
          </button>
        </form>
      </section>

      {isCelebrating && celebrationRecord ? (
        <CelebrationModal
          record={celebrationRecord}
          shareComment={shareComment}
          setShareComment={setShareComment}
          shareStatus={shareStatus}
          onShare={handleShare}
          onClose={resetCelebrateState}
          shareImagePreview={shareImagePreview}
          onShareImageChange={handleImageChange}
        />
      ) : null}
    </div>
  );
}

type CelebrationModalProps = {
  record: PersonalRecord;
  shareComment: string;
  setShareComment: (value: string) => void;
  shareStatus: "idle" | "shared";
  onShare: () => void;
  onClose: () => void;
  shareImagePreview: string | null;
  onShareImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function CelebrationModal({
  record,
  shareComment,
  setShareComment,
  shareStatus,
  onShare,
  onClose,
  shareImagePreview,
  onShareImageChange,
}: CelebrationModalProps) {
  const readableDate = (() => {
    const date = new Date(record.loggedAt);
    if (Number.isNaN(date.getTime())) {
      return record.loggedAt;
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  })();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
    >
      <div className="relative flex w-full max-w-2xl flex-col gap-6 overflow-hidden rounded-[40px] border border-brand/30 bg-surface p-8 shadow-[0_48px_120px_rgba(0,0,0,0.45)]">
        <button
          onClick={onClose}
          aria-label="Close celebration"
          className="absolute right-5 top-5 h-10 w-10 rounded-full border border-white/10 bg-white/5 text-2xl text-foreground/70 transition hover:text-foreground"
        >
          ×
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full bg-brand/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.5em] text-brand">
            New PR unlocked
          </span>
          <h2 className="text-3xl font-semibold md:text-4xl">
            You just smashed {record.activity}!
          </h2>
          <p className="text-base text-foreground/80 md:text-lg">
            {record.value} {record.unit} · {readableDate}
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 rounded-3xl border border-brand/30 bg-brand-dark/30 p-6">
          <HighFiveAnimation />
          <p className="max-w-md text-center text-base text-foreground/90">
            Big respect! Throw your crew a high-five and let them know how this
            felt.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl bg-surface-muted/70 p-6 ring-1 ring-black/20">
          <h3 className="text-lg font-semibold">
            Share the moment with a comment or pic
          </h3>
          <textarea
            value={shareComment}
            onChange={(event) => setShareComment(event.target.value)}
            rows={4}
            placeholder="Walked up to the bar with zero doubts. Tempo work paid off!"
            className="rounded-2xl border border-white/10 bg-brand-dark/20 px-4 py-3 text-base text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
          />
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand/90">
              Add a picture (optional)
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={onShareImageChange}
              className="block rounded-2xl border border-dashed border-white/15 bg-brand-dark/10 px-4 py-3 text-sm text-foreground/80 file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-dark hover:border-brand/40"
            />
          </label>

          {shareImagePreview ? (
            <div className="relative max-h-48 overflow-hidden rounded-3xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shareImagePreview}
                alt="Preview of your PR moment"
                className="h-full w-full object-cover"
              />
              <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                Preview
              </span>
            </div>
          ) : null}
        </div>

        {shareStatus === "shared" ? (
          <div className="rounded-3xl border border-brand/50 bg-brand/15 px-5 py-4 text-sm font-medium text-brand">
            Shared! Your crew is about to send some high-fives.
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-foreground/70 transition hover:text-foreground"
          >
            Maybe later
          </button>
          <button
            onClick={onShare}
            disabled={shareStatus === "shared"}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand via-brand-accent to-brand-purple px-6 py-3 text-base font-semibold text-brand-dark shadow-lg transition hover:opacity-95 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            Share this PR
            <span aria-hidden className="text-xl">
              🙌
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function HighFiveAnimation() {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <span className="high-five-hand high-five-hand--left" aria-hidden>
        🖐️
      </span>
      <span className="high-five-hand high-five-hand--right" aria-hidden>
        🖐️
      </span>
      <span className="high-five-spark high-five-spark--top-left" aria-hidden>
        ✨
      </span>
      <span className="high-five-spark high-five-spark--top-right" aria-hidden>
        ✨
      </span>
      <span className="high-five-spark high-five-spark--bottom" aria-hidden>
        ✨
      </span>
    </div>
  );
}
