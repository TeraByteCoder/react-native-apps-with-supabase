---
name: builder
description: "Use when planned user stories must be implemented in the React Native, Storybook, shared package, or Supabase parts of the workout platform."
version: 1.0.0
author: Lukas
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [implementation, react-native, storybook, supabase, monorepo]
    related_skills: [planner, manager, worker]
---

# Builder Skill

## Overview

The builder skill turns approved planner stories into working repository changes. It is the main implementation skill for React Native screens, shared components, Storybook stories, Supabase Edge Functions, migrations, and package-level TypeScript code.

Builder works from acceptance criteria. It should not invent broad new scope. If requirements are unclear, hand the task back to planner or manager before making large changes.

## When to Use

- A user story has acceptance criteria and needs code implementation.
- Shared components or Storybook stories must be created or changed.
- Workout-app or admin-app screens need React Native implementation.
- Supabase Edge Functions or SQL migrations are required by a planned use case.
- Existing code must be refactored to match the architecture in the README.

Do not use this skill for backlog creation or final coordination. Use planner for requirements and manager for final review.

## Repository Targets

Common implementation paths:

```text
apps/workout-app/                  Mobile athlete app
apps/admin-app/                    Web/admin app via Expo Web
packages/shared-components/src/    Reusable UI and design components
packages/shared-components/stories Storybook component stories
packages/shared-types/src/         Shared TypeScript contracts
packages/shared-utils/src/         Shared helpers
supabase/functions/                Edge Functions as API/application layer
supabase/migrations/               Tables, RLS policies, SQL domain functions
```

## Implementation Workflow

1. Read the assigned user story and acceptance criteria.
2. Identify affected paths and existing exports.
3. Make the smallest coherent code change.
4. For shared UI, create or update a Storybook story.
5. Export reusable components from `packages/shared-components/src/index.ts`.
6. Keep Supabase rules clear:
   - Edge Functions validate and orchestrate.
   - SQL Functions hold domain logic and transactional rules.
   - RLS policies protect data access.
7. Run the relevant verification command.
8. Report changed files and verification output to manager.

## CDD Rules for UI Work

Use component-driven development for reusable UI:

- Atoms: small UI pieces such as buttons, text labels, badges, and inputs.
- Molecules: compact composed units such as form fields, metric cards, or workout list items.
- Organisms: full screen sections such as landing hero, registration form, dashboard overview, or navigation.

Every reusable component should have:

- A clear TypeScript props type.
- React Native primitives instead of web-only HTML assumptions.
- Styles in `StyleSheet.create` or the shared theme.
- A Storybook story with default args and meaningful variants.

## Verification Commands

Use the smallest command that proves the change:

```bash
npm run check-types
npm run build
npm run storybook
npm run build-storybook
```

For package-specific work, workspace commands may be enough:

```bash
npm run check-types --workspace @workout/shared-components
npm run build-storybook --workspace @workout/shared-components
```

## Common Pitfalls

1. Implementing without a story. Shared UI must be reviewable in Storybook.
2. Deep-importing components everywhere. Prefer package exports through `src/index.ts`.
3. Putting business rules into Edge Functions when they belong in SQL Functions.
4. Copying prototype CSS directly into React Native. Translate layout and tokens instead.
5. Changing unrelated files. Keep builder changes tied to the assigned story.

## Verification Checklist

- [ ] Implementation maps to a planner user story.
- [ ] Changed files are limited to the affected areas.
- [ ] Reusable UI is exported and has a Storybook story.
- [ ] TypeScript checks pass for affected packages or the full repo.
- [ ] Supabase code respects Edge Function and SQL Function boundaries.
- [ ] Manager receives changed files plus real verification output.
