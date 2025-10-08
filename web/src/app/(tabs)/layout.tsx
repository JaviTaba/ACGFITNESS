import { ReactNode } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import Link from "next/link";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/home" className="inline-flex items-center gap-3">
            <span className="rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              ACOGO
            </span>
            <span className="text-2xl font-bold text-brand">FITNESS</span>
          </Link>
          <p className="mt-2 max-w-2xl text-sm text-foreground/70">
            Stay aligned with your goals and celebrate meaningful progress with
            the friends who keep you accountable.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface px-4 py-3 shadow-inner shadow-black/20">
          <div className="h-10 w-10 rounded-full bg-brand/20 ring-2 ring-brand/30" />
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-foreground">
              Alex Martinez
            </span>
            <span className="text-foreground/60">@alexmartinez</span>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
