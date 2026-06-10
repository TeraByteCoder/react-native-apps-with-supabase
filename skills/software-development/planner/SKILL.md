---
name: planner
description: "Use when an assignment, prototype, or feature idea must be converted into clear user stories, acceptance criteria, and a task split for manager-managed worker subagents."
version: 1.1.0
author: Lukas
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [planning, user-stories, storybook, backlog, subagents]
    related_skills: [manager, worker]
---

# Planner Skill

## Overview

The planner skill is the first role in the workflow. It reads the assignment, README, prototypes, and user request, then creates the user stories that will later be executed by worker subagents.

Planner does not manage subagents and does not implement code directly. Its job is to make the work small, clear, testable, and ready for the manager.

In this project, “Storys” means user stories, not Storybook stories. If the task is UI-related, planner can still require Storybook coverage in the acceptance criteria.

## When to Use

- A new assignment or feature must be split into work packages.
- User wishes are vague and need to become concrete user stories.
- The manager needs a backlog it can hand to worker subagents.
- A React Native, Supabase, or Storybook-related task needs acceptance criteria.
- Before any implementation starts.

Do not use planner for subagent orchestration. Use manager for that.
Do not use planner for implementation. Worker subagents do that after manager assigns stories.

## Inputs

Planner should inspect or receive:

- the assignment text or PDF summary,
- `README.md`,
- prototypes under `docs/ui/prototypes/`,
- existing project structure,
- current constraints such as React Native, Expo, Storybook, Supabase Edge Functions, SQL Functions, and CDD.

## Output: User Story Backlog

Write each story in this exact shape:

```text
US-<number>: <short title>
As a <role>,
I want <capability>,
so that <benefit>.

Priority: Must | Should | Could
Worker type: ui-worker | backend-worker | docs-worker | validation-worker | packaging-worker
Affected paths:
- <path>
Dependencies: <story ids or none>
Acceptance criteria:
- Given <context>, when <action>, then <result>.
- Given <context>, when <action>, then <result>.
Implementation notes:
- <short technical hints, no full implementation>
Verification:
- <command or manual check>
```

## Worker Types

Use these worker types so the manager can dispatch the right subagent:

- `ui-worker`: React Native screens, shared components, design system, Storybook stories.
- `backend-worker`: Supabase Edge Functions, migrations, SQL Functions, RLS.
- `docs-worker`: README, usage docs, assignment documentation.
- `validation-worker`: type checks, skill validation, file checks, review checks.
- `packaging-worker`: abgabe ZIP, generated artifacts, submission folders.

## Planning Rules

1. Every story must be small enough for one worker subagent.
2. Every story must have testable acceptance criteria.
3. UI stories must mention Storybook when reusable components are touched.
4. Backend stories must state whether logic belongs in Edge Functions or SQL Functions.
5. Documentation and packaging must be separate stories if they are required.
6. Avoid vague tasks like “make app better”. Convert them into concrete user outcomes.

## Handoff to Manager

End every planner result with a manager handoff:

```text
Manager handoff:
- Total stories: <n>
- Suggested parallel groups:
  - Group A: US-01, US-02
  - Group B: US-03
- Sequential blockers:
  - US-04 waits for US-02
- Required final checks:
  - npm run check-types
  - skill validation script
  - ZIP content check
```

## Common Pitfalls

1. Writing implementation steps instead of user stories.
2. Forgetting acceptance criteria, which makes worker verification weak.
3. Making stories too big for one subagent.
4. Mixing manager responsibilities into planner output.
5. Forgetting Storybook requirements for reusable UI components.
6. Ignoring dependencies between stories.

## Verification Checklist

- [ ] Every story has role, goal, benefit, priority, worker type, paths, and dependencies.
- [ ] Acceptance criteria are testable.
- [ ] Storybook is required where reusable UI is touched.
- [ ] Backend boundary between Edge Functions and SQL Functions is clear when relevant.
- [ ] Manager handoff includes story count, parallel groups, blockers, and final checks.
