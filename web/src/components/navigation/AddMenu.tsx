"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  Plus,
  Utensils,
  Scale,
  Dumbbell,
  Megaphone,
  X,
} from "lucide-react";

const ACTIONS = [
  {
    href: "/home?compose=meal",
    label: "New Meal",
    description: "Log what you just ate",
    icon: Utensils,
  },
  {
    href: "/home?compose=metrics",
    label: "New Weight/Measures",
    description: "Track your body changes",
    icon: Scale,
  },
  {
    href: "/home?compose=workout",
    label: "New Workout",
    description: "Record a training session",
    icon: Dumbbell,
  },
  {
    href: "/explore?compose=post",
    label: "New Post",
    description: "Share progress with friends",
    icon: Megaphone,
  },
];

export function AddMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKey);
    }
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="relative flex w-16 justify-center">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <button
        type="button"
        aria-label={open ? "Close quick actions" : "Open quick actions"}
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          "relative z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 transition-all duration-200",
          open
            ? "bg-brand text-background shadow-lg shadow-brand/30"
            : "bg-brand text-background shadow-md shadow-brand/40 hover:shadow-lg",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
      {open && (
        <div className="absolute bottom-20 left-1/2 z-40 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-surface-muted/95 p-3 shadow-xl shadow-black/40 backdrop-blur">
          <p className="px-1 text-xs uppercase tracking-[0.2em] text-foreground/60">
            Quick add
          </p>
          <ul className="mt-2 space-y-2">
            {ACTIONS.map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface px-3 py-2 transition hover:border-brand hover:bg-surface-muted"
                >
                  <action.icon className="h-5 w-5 text-brand" />
                  <span className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-foreground">
                      {action.label}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {action.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
