"use client";

import { useMemo, useState } from "react";
import { sampleFriends, sampleWeights } from "../lib/sample-data";

const currentUser = {
  name: "Alex Chen",
  username: "alex.chen",
  goal: "Build lean strength",
  avatar: "https://i.pravatar.cc/150?img=32",
  bio: "Runner. Engineer. Loves ramen and sunrise miles.",
  stats: {
    friends: 28,
    workoutsThisMonth: 12,
    streak: 7
  }
};

const posts = sampleFriends[0].posts;

export function Profile() {
  const [visibleCount, setVisibleCount] = useState(4);
  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [visibleCount]);

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4 rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5 text-sm text-slate-300">
        <div className="flex items-center gap-4">
          <img src={currentUser.avatar} alt="" className="h-16 w-16 rounded-full border-2 border-brand-lime object-cover" />
          <div>
            <p className="text-lg font-semibold text-brand-lime">{currentUser.name}</p>
            <p className="text-xs text-slate-400">@{currentUser.username}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400">{currentUser.bio}</p>
        <dl className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="rounded-2xl border border-slate-800/50 bg-slate-950/50 p-3">
            <dt className="text-slate-400">Friends</dt>
            <dd className="mt-1 text-lg font-semibold text-brand-lime">{currentUser.stats.friends}</dd>
          </div>
          <div className="rounded-2xl border border-slate-800/50 bg-slate-950/50 p-3">
            <dt className="text-slate-400">Workouts</dt>
            <dd className="mt-1 text-lg font-semibold text-brand-lime">{currentUser.stats.workoutsThisMonth}</dd>
          </div>
          <div className="rounded-2xl border border-slate-800/50 bg-slate-950/50 p-3">
            <dt className="text-slate-400">Streak</dt>
            <dd className="mt-1 text-lg font-semibold text-brand-lime">{currentUser.stats.streak}</dd>
          </div>
        </dl>
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Goals</h2>
          <ul className="mt-2 space-y-2 text-xs">
            <li className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-3">
              <p className="font-semibold text-brand-lime">Maintain 7-day streak</p>
              <p className="mt-1 text-slate-400">Stay consistent with morning workouts.</p>
            </li>
            <li className="rounded-xl border border-slate-800/50 bg-slate-950/50 p-3">
              <p className="font-semibold text-brand-lime">Fuel smart</p>
              <p className="mt-1 text-slate-400">Hit 140g protein daily.</p>
            </li>
          </ul>
        </section>
      </aside>
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Weekly overview</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">Weight and streak</span>
          </header>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Weight</h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                {sampleWeights.slice(-5).map((entry) => (
                  <li key={entry.date} className="flex items-center justify-between">
                    <span>{entry.date}</span>
                    <span className="text-brand-lime">{entry.value} lbs</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Consistency</h3>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {Array.from({ length: 14 }, (_, index) => index).map((day) => (
                  <span
                    key={day}
                    className={`h-8 rounded-lg ${day < currentUser.stats.streak ? "bg-brand-lime/80" : "bg-slate-800"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Activity feed</h2>
            <button
              type="button"
              onClick={() => setVisibleCount((count) => Math.min(posts.length, count + 3))}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-brand-lime hover:text-brand-lime"
            >
              Load more
            </button>
          </header>
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {visiblePosts.map((post) => (
              <li key={post.id} className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4">
                <p className="text-sm font-semibold text-brand-lime">{post.title}</p>
                <p className="mt-1 text-xs text-slate-400">{post.content}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
