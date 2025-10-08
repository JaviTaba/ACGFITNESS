"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Logo } from "./logo";
import { NewLogSheet } from "./new-log-sheet";
import { LogsProvider } from "../lib/logs-context";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/profile", label: "Profile" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newLogOpen, setNewLogOpen] = useState(false);

  return (
    <LogsProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Logo />
            <nav className="hidden items-center gap-8 text-sm font-medium text-slate-200 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx("transition-colors hover:text-brand-lime", {
                    "text-brand-lime": pathname === link.href
                  })}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNewLogOpen(true)}
                className="flex items-center gap-1 rounded-full bg-brand-purple px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-purple/40 transition hover:bg-brand-purple/90"
              >
                <PlusIcon className="h-4 w-4" />
                New Log
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-brand-lime hover:text-brand-lime md:hidden"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          </div>
          {isMobileMenuOpen ? (
            <nav className="border-t border-slate-800 bg-slate-950/95 px-4 py-3 text-sm text-slate-200 md:hidden">
              <ul className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={clsx("block rounded-lg px-3 py-2", {
                        "bg-brand-purple/20 text-brand-lime": pathname === link.href
                      })}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
          {children}
        </main>
        <NewLogSheet open={newLogOpen} onOpenChange={setNewLogOpen} />
      </div>
    </LogsProvider>
  );
}
