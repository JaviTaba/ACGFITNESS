# AcogoFitness Architecture Overview

## Vision

AcogoFitness blends personal fitness tracking with intimate social connections. Users log meals, workouts, biometrics, and progress photos while sharing curated updates exclusively with accepted friends. The experience mirrors trusted networks such as LinkedIn or Facebook, emphasizing bilateral friendships over follower counts.

## Core Tenets

- **Brand fidelity:** Bright lime and deep green primaries, accented with bold purple, matching the provided logo.
- **Test-first delivery:** Business logic evolves under automated tests to guarantee regressions are caught early.
- **Modular separation:** Distinct layers for domain logic, API transport, and UI presentation to keep changes localized.
- **Offline-friendly foundation:** Initial persistence via SQLite with room to swap to a cloud database later.

## Stack Selection

- **Runtime:** Node.js 20, TypeScript throughout.
- **API:** Next.js App Router (server components) providing REST-ish JSON routes plus server actions where helpful.
- **ORM:** Prisma with SQLite for rapid iteration; Prisma schema mirrors domain models.
- **Auth:** NextAuth.js with email/password stub (later replaceable by OAuth providers). For now, focus on user + session scaffolding.
- **Testing:** Vitest for unit/integration, Playwright for smoke e2e (deferred until UI stabilizes).
- **UI:** Next.js with Tailwind CSS for quick styling and responsive layouts. Brand palette codified as Tailwind theme tokens. Component abstractions via Radix UI where needed.

## Domain Model (v0)

- `User`: profile, privacy defaults, friend relationships (pending/accepted). Users expose limited profile snapshots pre-acceptance.
- `FitnessSnapshot`: daily roll-up containing weight, measurements, steps, macro goals, linked entries.
- `MealLog`: meal name, timestamp, macro breakdown, optional photo.
- `Workout`: exercises performed, volume, intensity, notes.
- `Measurement`: body metrics (waist, hips, chest, etc.).
- `ProgressPhoto`: stored metadata pointing to object storage (stubbed locally).
- `Post`: social updates referencing underlying logs or stand-alone content.
- `FriendRequest`: state machine (`pending`, `accepted`, `declined`).

## Feature Slices

1. **Home Dashboard:** Widgets summarizing recent metrics, upcoming goals, and quick actions. Graphing via Recharts.
2. **Explore Feed:** Friend updates, friend search restricted to exact usernames/email, with preview cards.
3. **Profile Hub:** Aggregated settings, goals, log history with filters, and privacy controls.
4. **Add Hub:** Floating action button exposing log creation forms that fan out modally.

## UI Composition

- **Layout shell:** `app/(tabs)/layout.tsx` renders the account header, gradient background, and persistent bottom navigation. A floating action button (`AddMenu`) exposes logging shortcuts.
- **Home dashboard:** Server component aggregates `getDashboard` data, while `WeightTrendChart` renders client-side via Recharts. Daily targets (steps, macros, measurements) surface as cards.
- **Explore feed:** Server component pulls friend updates through `getFeed`, with fallbacks that mirror the Prisma contract. The page also exposes a search affordance prepared for real friend discovery.
- **Profile hub:** Combines `getProfile` and `getDashboard` to render goals, badges, streak progress, and body metrics.
- **State management:** React Query provider (`Providers`) is in place even though initial pages rely on server data + fallbacks; hydrations can swap to client queries once auth/session plumbing lands.
- **Styling:** Tailwind v4 theme tokens encode the lime/green/purple palette. Cards lean on translucent surfaces + backdrop blur to echo the provided logo's glow.

## Data Privacy

- All content private by default; search returns only minimal profile (name, avatar, tagline) until request accepted.
- API validates requester permissions for every resource access.
- Future: audit logging to track read/write events.
- Sharing controls surface a Facebook-style "Who can see this?" selector for every post with four options:
  - **Public:** visible to anyone accepted in the viewer graph.
  - **Friends:** restricted to bilateral friendships.
  - **Close Friends:** limited to the author's curated inner circle (data modelled now, UI to follow post-MVP).
  - **Just me:** stays on the author's timeline only.

## Roadmap Milestones

1. Scaffold Next.js + Prisma + Vitest. ✅
2. Implement domain services for friendship workflow, streak tracking, and fitness logging under unit tests. ✅
3. Ship API routes with integration tests using in-memory repositories (friend requests, tracking logs, feed, profile). ✅
4. Build dashboard/feed/profile UIs with branded styling, relying on API fetchers that gracefully fall back to demo data offline. ✅
5. Harden persistence (resolve `prisma db push` engine error, seed demo data), authentication, file storage, and notifications. ⏳
6. Layer client-side mutations (React Query) and optimistic updates for meal/workout logging and social interactions. ⏳

This document evolves alongside implementation.***
