import { NextResponse } from "next/server";
import { demoProfile } from "@/lib/demo-data";
import type { ProfileOverview } from "@/lib/types";

interface ProfileHandlerDependencies {
  getProfile?: (userId: string) => Promise<ProfileOverview | null>;
}

export function buildProfileHandlers(
  { getProfile }: ProfileHandlerDependencies = {},
) {
  const GET = async (request: Request) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    try {
      const profile =
        (await getProfile?.(userId)) ??
        demoProfile;
      return NextResponse.json(profile, { status: 200 });
    } catch (error) {
      console.error("Failed to load profile", error);
      return NextResponse.json(
        { error: "Unexpected error loading profile." },
        { status: 500 },
      );
    }
  };

  return { GET };
}

export const { GET } = buildProfileHandlers();
