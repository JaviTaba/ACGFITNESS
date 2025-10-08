"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Home,
  Users,
  CircleUserRound,
} from "lucide-react";
import { AddMenu } from "@/components/navigation/AddMenu";

const NAV_ITEMS = [
  {
    href: "/home",
    label: "Home",
    icon: Home,
  },
  {
    href: "/explore",
    label: "Explore",
    icon: Users,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: CircleUserRound,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-4">
      <div className="pointer-events-auto flex w-[min(640px,calc(100%-1.5rem))] items-center justify-between rounded-3xl border border-white/10 bg-surface/95 px-4 py-2 shadow-lg shadow-black/30 backdrop-blur">
        <nav className="flex w-full items-center justify-between">
          {NAV_ITEMS.slice(0, 1).map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname?.startsWith(item.href) ?? false}
            />
          ))}
          <AddMenu />
          {NAV_ITEMS.slice(1).map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname?.startsWith(item.href) ?? false}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}

function NavLink({ href, label, icon: Icon, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex flex-col items-center gap-1 rounded-full px-3 py-2 text-xs font-medium transition-colors",
        active
          ? "text-brand underline decoration-brand underline-offset-8"
          : "text-foreground/70 hover:text-foreground",
      )}
    >
      <Icon
        className={clsx(
          "h-5 w-5 transition-transform",
          active ? "scale-110 text-brand" : "text-foreground/70",
        )}
      />
      <span>{label}</span>
    </Link>
  );
}
