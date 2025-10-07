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

## Data Privacy

- All content private by default; search returns only minimal profile (name, avatar, tagline) until request accepted.
- API validates requester permissions for every resource access.
- Future: audit logging to track read/write events.

## Roadmap Milestones

1. Scaffold Next.js + Prisma + Vitest.
2. Implement domain services for friendship workflow and fitness logging under unit tests.
3. Ship API routes with integration tests using in-memory SQLite.
4. Build dashboard/feed/profile UIs with mocked fetchers, then connect to live endpoints.
5. Harden authentication, file storage, and notifications.

This document evolves alongside implementation.***
