"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { sampleCalories, sampleFeed, sampleWeights, sampleWorkouts } from "../lib/sample-data";
import { useLogs } from "../lib/logs-context";
import { StreakCelebration } from "./streak-celebration";

const WIDGETS = [
  { id: "weight", label: "Weight trend", size: "widget-3-1" },
  { id: "workouts", label: "Recent workouts", size: "widget-2-1" },
  { id: "calories", label: "Calories", size: "widget-1-1" },
  { id: "friends", label: "Friends updates", size: "widget-2-1" },
  { id: "streak", label: "Friends streak", size: "widget-1-1" },
  { id: "logs", label: "Your latest logs", size: "widget-2-1" }
] as const;

type WidgetId = (typeof WIDGETS)[number]["id"];

const PIE_COLORS = ["#C7F03B", "#6F2C91", "#38BDF8"];

export function Dashboard() {
  const { logs } = useLogs();
  const [activeWidgets, setActiveWidgets] = useState<WidgetId[]>(() => ["weight", "workouts", "calories", "friends", "streak", "logs"]);
  const [streakToast, setStreakToast] = useState<{ open: boolean; streak: number }>({ open: false, streak: 0 });
  const [celebratedStreak, setCelebratedStreak] = useState<number | null>(null);

  const streakDays = useMemo(() => {
    const base = 6;
    const loggedToday = logs.some((log) => log.type === "workout" || log.type === "note");
    return base + (loggedToday ? 1 : 0);
  }, [logs]);

  useEffect(() => {
    if (streakDays >= 7 && celebratedStreak !== streakDays) {
      setStreakToast({ open: true, streak: streakDays });
      setCelebratedStreak(streakDays);
    }
  }, [streakDays, celebratedStreak]);

  const toggleWidget = (widget: WidgetId) => {
    setActiveWidgets((prev) => (prev.includes(widget) ? prev.filter((id) => id !== widget) : [...prev, widget]));
  };

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case "weight":
        return (
          <div className="flex h-full flex-col rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Weight trend</h3>
              <span className="text-xs text-slate-500">Past 7 days</span>
            </div>
            <div className="mt-2 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampleWeights}>
                  <XAxis dataKey="date" stroke="#475569" hide />
                  <Tooltip contentStyle={{ backgroundColor: "#020617", borderRadius: 12, border: "1px solid #1f2937" }} />
                  <Line type="monotone" dataKey="value" stroke="#C7F03B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "workouts":
        return (
          <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Recent workouts</h3>
              <span className="text-xs text-slate-500">Last 48 hours</span>
            </header>
            <ul className="space-y-3 overflow-y-auto pr-1 text-sm text-slate-200">
              {sampleWorkouts.map((workout) => (
                <li key={workout.title} className="rounded-xl border border-slate-800/60 bg-slate-900/60 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-brand-lime">{workout.title}</span>
                    <span className="text-xs text-slate-400">{workout.intensity}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Duration: {workout.duration} mins</p>
                </li>
              ))}
            </ul>
          </div>
        );
      case "calories":
        return (
          <div className="flex h-full flex-col rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Macro split</h3>
            <div className="flex flex-1 items-center justify-center">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie dataKey="value" data={sampleCalories} innerRadius={40} outerRadius={60} paddingAngle={4}>
                    {sampleCalories.map((entry, index) => (
                      <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              {sampleCalories.map((macro) => (
                <li key={macro.label} className="flex items-center justify-between">
                  <span>{macro.label}</span>
                  <span className="text-brand-lime">{macro.value}g</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case "friends":
        return (
          <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Friends updates</h3>
              <span className="text-xs text-slate-500">Curated</span>
            </header>
            <ul className="space-y-3 text-sm text-slate-200">
              {sampleFeed.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-800/60 bg-slate-900/60 px-3 py-2">
                  <p className="font-semibold text-brand-lime">{item.author.name}</p>
                  <p className="mt-1 text-xs text-slate-300">{item.content}</p>
                </li>
              ))}
            </ul>
          </div>
        );
      case "streak":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Current streak</h3>
            <p className="text-4xl font-bold text-brand-lime">{streakDays}</p>
            <p className="text-xs text-slate-400">days in a row logged</p>
            <p className="mt-2 text-xs text-slate-500">Add today's workout log to keep it going.</p>
          </div>
        );
      case "logs":
        return (
          <div className="flex h-full flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Latest logs</h3>
              <span className="text-xs text-slate-500">{logs.length} total</span>
            </header>
            {logs.length === 0 ? (
              <p className="flex-1 rounded-2xl border border-dashed border-slate-700 px-3 py-6 text-center text-xs text-slate-500">
                No logs yet. Use the New Log button to get started.
              </p>
            ) : (
              <ul className="space-y-2 overflow-y-auto pr-1 text-xs text-slate-300">
                {logs.slice(0, 5).map((log) => (
                  <li key={log.id} className="rounded-xl border border-slate-800/60 bg-slate-900/60 px-3 py-2">
                    <p className="font-semibold text-brand-lime">{log.type.toUpperCase()}</p>
                    <pre className="mt-1 whitespace-pre-wrap text-[11px] text-slate-400">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Morning, Alex</h1>
          <p className="text-sm text-slate-400">Curate what matters. Toggle widgets to tailor your dashboard.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {WIDGETS.map((widget) => (
            <button
              key={widget.id}
              type="button"
              onClick={() => toggleWidget(widget.id)}
              className={
                "rounded-full px-4 py-2 transition" +
                (activeWidgets.includes(widget.id)
                  ? " bg-brand-purple text-white shadow shadow-brand-purple/40"
                  : " border border-slate-700 text-slate-300 hover:border-brand-lime hover:text-brand-lime")
              }
            >
              {widget.label}
            </button>
          ))}
        </div>
      </header>
      <div className="dashboard-grid">
        <AnimatePresence initial={false}>
          {activeWidgets.map((widget) => (
            <motion.div
              key={widget}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={WIDGETS.find((w) => w.id === widget)?.size}
            >
              {renderWidget(widget)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <StreakCelebration open={streakToast.open} streak={streakToast.streak} onOpenChange={(open) => setStreakToast((prev) => ({ ...prev, open }))} />
    </section>
  );
}
