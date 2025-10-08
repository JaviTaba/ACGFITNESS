"use client";

import { useMemo, useState } from "react";
import { sampleFeed, sampleFriends } from "../lib/sample-data";

export function Explore() {
  const [query, setQuery] = useState("");

  const filteredFriends = useMemo(() => {
    return sampleFriends.filter((friend) => friend.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Explore friends</h1>
          <p className="text-sm text-slate-400">Search for friends and catch up on their latest posts.</p>
        </div>
        <input
          type="search"
          placeholder="Search by name or email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-full border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-lime"
        />
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredFriends.map((friend) => (
          <article key={friend.id} className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4">
              <img src={friend.avatar} alt="" className="h-14 w-14 rounded-full border-2 border-brand-purple object-cover" />
              <div>
                <h2 className="text-lg font-semibold text-brand-lime">{friend.name}</h2>
                <p className="text-xs uppercase tracking-wide text-slate-400">Goal: {friend.goal}</p>
                <p className="text-xs text-slate-400">Streak: {friend.streak} days</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-200">
              <p className="font-semibold text-slate-100">Latest highlight</p>
              <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-3">
                <p className="text-brand-lime">{friend.latestPost.title}</p>
                <p className="text-xs text-slate-400">{friend.latestPost.excerpt}</p>
              </div>
            </div>
            <div className="mt-4">
              <details className="group rounded-2xl border border-slate-800/60 bg-slate-950/60">
                <summary className="cursor-pointer rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 transition group-open:text-brand-lime">
                  Recent posts
                </summary>
                <ul className="space-y-3 px-4 pb-4 text-xs text-slate-400">
                  {friend.posts.map((post) => (
                    <li key={post.id} className="rounded-xl border border-slate-800/50 bg-slate-900/50 p-3">
                      <p className="text-sm text-brand-lime">{post.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{post.content}</p>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </article>
        ))}
        {filteredFriends.length === 0 ? (
          <p className="col-span-full rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
            No friends found. Try a different search.
          </p>
        ) : null}
      </div>
      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Fresh posts</h2>
          <span className="text-xs uppercase tracking-wide text-slate-500">From your circle</span>
        </header>
        <div className="space-y-3">
          {sampleFeed.map((item) => (
            <article key={item.id} className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-lime">{item.author.name}</p>
                  <p className="text-xs text-slate-400">{item.author.goal}</p>
                </div>
                <span className="text-xs text-slate-500">{item.attachedLogs.join(", ")}</span>
              </div>
              <p className="mt-3 text-sm text-slate-200">{item.content}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
