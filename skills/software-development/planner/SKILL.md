---
name: planner
description: "Use when a product idea or prototype must be translated into user stories, acceptance criteria, priorities, and a concrete backlog for the workout platform."
version: 1.0.0
author: Lukas
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [planning, user-stories, backlog, workout-platform, supabase]
    related_skills: [manager, builder, worker]
---

# Planner Skill

## Overview

The planner skill turns the assignment, README, prototype screens, and user wishes into a clear implementation plan. Its main output is a backlog made of user stories, acceptance criteria, dependencies, and priorities.

Use this skill before coding. The planner does not implement features directly. It defines what should be built, why it matters, how success is checked, and which downstream skill should handle each task.

## When to Use

- A new feature or screen must be clarified before implementation.
- The assignment needs to be converted into user stories.
- The team needs a prioritized backlog for workout-app, admin-app, shared components, or Supabase.
- Requirements are mixed across README, prototypes, and chat notes.
- Builder, worker, or manager need a precise task brief.

Do not use this skill for direct coding, refactoring, or final quality control. Use builder for implementation, worker for focused execution tasks, and manager for coordination and review.

## Inputs

Collect these inputs before writing stories:

- Assignment or README sections that define the feature.
- Prototype files under `docs/ui/prototypes/` when UI is involved.
- Existing app/package paths:
  - `apps/workout-app`
  - `apps/admin-app`
  - `packages/shared-components`
  - `packages/shared-types`
  - `packages/shared-utils`
  - `supabase/functions`
  - `supabase/migrations`
- Known constraints, for example React Native, Expo, Storybook, Supabase Edge Functions, SQL Functions, and CDD.

## User Story Format

Write every story in this shape:

```text
US-<number>: <short title>
As a <role>,
I want <capability>,
so that <benefit>.

Priority: Must | Should | Could
Owner skill: planner | manager | builder | worker
Affected areas: <paths>
Dependencies: <story ids or none>
Acceptance criteria:
- Given <context>, when <action>, then <result>.
- Given <context>, when <action>, then <result>.
Implementation notes:
- <technical note>
Verification:
- <command, storybook check, typecheck, or manual check>
```

## Story Roles

Use concrete roles from the workout platform:

- Visitor: sees landing, login, and registration entry points.
- Athlete: uses workouts, plans, progress, and profile features.
- Coach/Admin: manages exercises, plans, users, and analytics in the admin app.
- Developer: works with shared components, Storybook, and Supabase contracts.

## Prioritization Rules

1. Must: required by the assignment, needed for the app to run, or blocks other stories.
2. Should: important for a clean demo, but not a hard blocker.
3. Could: polish, later extension, or optional improvement.

Keep the first backlog small enough to implement. Prefer 5 to 12 high-quality stories over a huge vague list.

## Handoff to Other Skills

After planning, create a short handoff table:

```text
Story | Next skill | Reason
US-01 | builder | Needs React Native component implementation
US-02 | worker | Needs one isolated Supabase migration
US-03 | manager | Needs cross-app coordination and review
```

## Common Pitfalls

1. Writing tasks instead of user stories. A story must state role, capability, and benefit.
2. Missing acceptance criteria. Without them, builder and worker cannot verify completion.
3. Planning too broadly. Keep scope tied to the assignment and existing repository.
4. Mixing implementation into planning. Planner may suggest paths and commands, but should not write code.
5. Forgetting Supabase boundaries. Edge Functions orchestrate use cases; SQL Functions hold domain logic.

## Verification Checklist

- [ ] Every story has role, goal, benefit, priority, owner skill, and affected paths.
- [ ] Acceptance criteria are testable.
- [ ] Dependencies are explicit.
- [ ] Handoff to manager, builder, or worker is clear.
- [ ] Scope matches the assignment and README.
