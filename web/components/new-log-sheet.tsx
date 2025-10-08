"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Fragment, useMemo, useState } from "react";
import { useLogs } from "../lib/logs-context";
import { z } from "zod";

const tabs = [
  { id: "weight", label: "Weight" },
  { id: "workout", label: "Workout" },
  { id: "calories", label: "Calories" },
  { id: "note", label: "Note" }
] as const;

type TabId = (typeof tabs)[number]["id"];

const workoutSchema = z.object({
  title: z.string().min(1),
  duration: z.number().nonnegative(),
  intensity: z.enum(["Easy", "Moderate", "Hard"])
});

const weightSchema = z.object({
  weight: z.number().positive(),
  trend: z.enum(["down", "steady", "up"])
});

const calorieSchema = z.object({
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fats: z.number().nonnegative()
});

const noteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1)
});

export function NewLogSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { createLog } = useLogs();
  const [activeTab, setActiveTab] = useState<TabId>("weight");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createInitialState = useMemo(
    () =>
      () => ({
        weight: { weight: 180, trend: "steady" as const },
        workout: { title: "", duration: 30, intensity: "Moderate" as const },
        calories: { calories: 2200, protein: 140, carbs: 210, fats: 60 },
        note: { title: "", content: "" }
      }),
    []
  );

  const [formState, setFormState] = useState(createInitialState);

  const reset = () => {
    setFormState(createInitialState());
    setErrors({});
    setActiveTab("weight");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    const formData = formState[activeTab];

    const { result, error } = (() => {
      switch (activeTab) {
        case "weight":
          return { result: weightSchema.safeParse(formData) };
        case "workout":
          return { result: workoutSchema.safeParse(formData) };
        case "calories":
          return { result: calorieSchema.safeParse(formData) };
        case "note":
          return { result: noteSchema.safeParse(formData) };
        default:
          return { error: new Error("Unknown tab") };
      }
    })();

    if (result && result.success) {
      createLog({
        type: activeTab,
        payload: result.data
      });
      reset();
      onOpenChange(false);
      return;
    }

    const fieldErrors: Record<string, string> = {};
    if (result && !result.success) {
      for (const issue of result.error.issues) {
        fieldErrors[issue.path.join(".")] = issue.message;
      }
    } else if (error) {
      fieldErrors.base = error.message;
    }
    setErrors(fieldErrors);
  };

  const handleChange = (tab: TabId, field: string, value: string | number) => {
    setFormState((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }));
  };

  const numericChange = (tab: TabId, field: string, value: string) => {
    const parsed = Number(value);
    handleChange(tab, field, Number.isNaN(parsed) ? 0 : parsed);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : (reset(), onOpenChange(false)))}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-brand-purple/30">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-brand-lime">Add a new log</Dialog.Title>
              <Dialog.Close className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-400 transition hover:border-brand-lime hover:text-brand-lime">
                Close
              </Dialog.Close>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    "rounded-full px-4 py-2 transition" +
                    (activeTab === tab.id
                      ? " bg-brand-purple text-white shadow shadow-brand-purple/40"
                      : " border border-slate-700 text-slate-300 hover:border-brand-lime hover:text-brand-lime")
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {errors.base ? (
                <p className="text-sm text-rose-400">{errors.base}</p>
              ) : null}
              {activeTab === "weight" && (
                <Fragment>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="text-sm">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Weight (lbs)</span>
                      <input
                        type="number"
                        value={formState.weight.weight}
                        onChange={(event) => numericChange("weight", "weight", event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-lime"
                      />
                      {errors.weight ? <span className="text-xs text-rose-400">{errors.weight}</span> : null}
                    </label>
                    <label className="text-sm">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Trend</span>
                      <select
                        value={formState.weight.trend}
                        onChange={(event) => handleChange("weight", "trend", event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-lime"
                      >
                        <option value="down">Trending Down</option>
                        <option value="steady">Holding Steady</option>
                        <option value="up">Trending Up</option>
                      </select>
                    </label>
                  </div>
                </Fragment>
              )}
              {activeTab === "workout" && (
                <Fragment>
                  <label className="text-sm">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Workout Title</span>
                    <input
                      type="text"
                      value={formState.workout.title}
                      onChange={(event) => handleChange("workout", "title", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-lime"
                    />
                    {errors.title ? <span className="text-xs text-rose-400">{errors.title}</span> : null}
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="text-sm">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Duration (minutes)</span>
                      <input
                        type="number"
                        value={formState.workout.duration}
                        onChange={(event) => numericChange("workout", "duration", event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-lime"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Intensity</span>
                      <select
                        value={formState.workout.intensity}
                        onChange={(event) => handleChange("workout", "intensity", event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-lime"
                      >
                        <option>Easy</option>
                        <option>Moderate</option>
                        <option>Hard</option>
                      </select>
                    </label>
                  </div>
                </Fragment>
              )}
              {activeTab === "calories" && (
                <Fragment>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {([
                      ["calories", "Calories"],
                      ["protein", "Protein"],
                      ["carbs", "Carbs"],
                      ["fats", "Fats"]
                    ] as const).map(([field, label]) => (
                      <label key={field} className="text-sm">
                        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
                        <input
                          type="number"
                          value={formState.calories[field]}
                          onChange={(event) => numericChange("calories", field, event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-lime"
                        />
                      </label>
                    ))}
                  </div>
                </Fragment>
              )}
              {activeTab === "note" && (
                <Fragment>
                  <label className="text-sm">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Title</span>
                    <input
                      type="text"
                      value={formState.note.title}
                      onChange={(event) => handleChange("note", "title", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-lime"
                    />
                    {errors.title ? <span className="text-xs text-rose-400">{errors.title}</span> : null}
                  </label>
                  <label className="text-sm">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Details</span>
                    <textarea
                      value={formState.note.content}
                      onChange={(event) => handleChange("note", "content", event.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-brand-lime"
                    />
                    {errors.content ? <span className="text-xs text-rose-400">{errors.content}</span> : null}
                  </label>
                </Fragment>
              )}
              <div className="flex items-center justify-end gap-3">
                <Dialog.Close className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-brand-lime hover:text-brand-lime">
                  Cancel
                </Dialog.Close>
                <button
                  type="submit"
                  className="rounded-full bg-brand-lime px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-lime-300"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
