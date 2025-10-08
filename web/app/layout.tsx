import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { AppShell } from "../components/app-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AcogoFitness",
  description: "Personal fitness meets close friends."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-950">
      <body className={`${inter.className} min-h-screen text-slate-100`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
