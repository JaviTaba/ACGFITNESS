import "server-only";

import type { ProfileOverview } from "@/lib/types";
import {
  demoProfile,
  demoPosts,
  demoSummary,
  demoWeightTrend,
  demoStreak,
} from "@/lib/demo-data";
import {
  DailySummary,
  WeightEntry,
} from "@/server/domain/tracking/tracking.service";
import { StreakSummary } from "@/server/domain/tracking/streak.service";
import { PostEntity } from "@/server/domain/social/social.service";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`Falling back to demo data for ${path}`, error);
    return null;
  }
}

export async function getDashboard(userId: string) {
  const result = await fetchJson<{
    summary: DailySummary;
    weightTrend: WeightEntry[];
    streak: StreakSummary;
  }>(`/api/dashboard?userId=${userId}`);

  if (result) {
    return result;
  }

  return {
    summary: demoSummary,
    weightTrend: demoWeightTrend,
    streak: demoStreak,
  };
}

export async function getFeed(userId: string) {
  const result = await fetchJson<{ posts: PostEntity[] }>(
    `/api/feed?userId=${userId}`,
  );

  if (result) {
    return result.posts;
  }

  return demoPosts;
}

export async function getProfile(userId: string): Promise<ProfileOverview> {
  const result = await fetchJson<ProfileOverview>(
    `/api/profile?userId=${userId}`,
  );
  return result ?? demoProfile;
}
