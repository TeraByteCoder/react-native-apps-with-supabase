---
name: planner
description: "Use when HTML/CSS prototypes, screenshots, or rough UI ideas must be converted into a worker-ready implementation plan without directly writing final user stories or doing implementation."
version: 1.2.0
author: Lukas
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [planning, prototypes, html-css, worker-plan, subagents]
    related_skills: [manager, worker]
---

# Planner Skill

## Overview

The planner skill is the separate planning role before manager orchestration. It reads the assignment, README, and especially HTML/CSS prototypes or visual mockups, then produces a worker-ready plan for the manager.

Planner does **not** directly write final user stories as its main output, does **not** implement code, and does **not** manage subagents. It translates prototype intent into small worker tasks, dependencies, acceptance checks, and files to inspect.

The skill follows the AgentSkills.io-style split: keep the `SKILL.md` focused on behavior; keep reusable templates in `templates/`; keep best-practice details in `resources/`.

## When to Use

- HTML/CSS prototypes, screenshots, Storybook mockups, or UI ideas must become an execution plan.
- A manager needs small tasks that can be assigned to individual worker subagents.
- UI work must be separated from backend, docs, validation, and packaging work.
- CDD decisions must be documented without mixing them into the project tech stack.
- Before manager starts any `delegate_task` worker orchestration.

Do not use planner for implementation. Worker subagents do that after manager assigns tasks.
Do not use planner for orchestration. Manager does that.
Do not use planner to produce broad, final user-story documents unless the manager explicitly asks for that format.

## Inputs

Planner should inspect or receive:

- assignment text or teacher requirements,
- `README.md`,
- HTML/CSS prototypes, screenshots, Storybook examples, or `docs/storyboard/`,
- current app/package structure,
- `resources/tech-stack.md` for technology boundaries,
- `resources/cdd.md` for component-driven development rules,
- `resources/worker-types.md` for dispatch targets,
- `templates/worker-plan-template.md` for output shape.

## Output: Worker Plan, Not Direct User Stories

Use `templates/worker-plan-template.md` as the exact output structure.

Each planned item should describe:

- prototype source and observed UI/behavior intent,
- target worker type,
- affected paths,
- dependencies and conflicts,
- acceptance checks,
- verification commands or manual checks,
- manager dispatch notes.

If the assignment later requires classical user stories, add them only as a derived appendix. The primary deliverable remains the manager-ready worker plan.

## Planning Rules

1. Start from the prototype: identify screens, components, states, interactions, and missing assets.
2. Split work by worker resource type from `resources/worker-types.md`.
3. Keep CDD rules in `resources/cdd.md`; keep libraries, Supabase, Expo, Storybook, and tooling in `resources/tech-stack.md`.
4. One planned task must be small enough for one worker subagent.
5. UI tasks must mention reusable components and Storybook coverage when components are touched.
6. Backend tasks must state whether work belongs in Edge Functions, SQL Functions, migrations, or RLS.
7. Docs, validation, and packaging are separate tasks when required.
8. Avoid vague tasks like “make prototype real”. Convert them into bounded worker tasks.

## Handoff to Manager

End every planner result with a manager handoff:

```text
Manager handoff:
- Total worker tasks: <n>
- Suggested parallel groups:
  - Group A: WT-01, WT-02
  - Group B: WT-03
- Sequential blockers:
  - WT-04 waits for WT-02
- Shared resources to include in every worker context:
  - skills/software-development/planner/resources/tech-stack.md
  - skills/software-development/planner/resources/cdd.md
  - skills/software-development/planner/resources/worker-types.md
  - skills/software-development/planner/resources/verification-checklist.md
- Required final checks:
  - npm run check-types
  - skill validation script
  - ZIP/content check if packaging changed
```

## Common Pitfalls

1. Writing final user stories instead of a manager-ready worker plan.
2. Mixing CDD principles into the tech-stack resource.
3. Keeping worker-type rules inside `SKILL.md` instead of `resources/worker-types.md`.
4. Forgetting to map prototype states to concrete worker tasks.
5. Making tasks too large for one worker subagent.
6. Forgetting Storybook requirements for reusable UI components.
7. Ignoring dependencies between tasks that touch the same files.

## Verification Checklist

Use the shared checklist in `resources/verification-checklist.md` and confirm:

- [ ] Planner output uses the worker-plan template.
- [ ] Every task has prototype source, worker type, paths, dependencies, acceptance checks, and verification.
- [ ] CDD and tech-stack guidance are referenced as separate resources.
- [ ] Worker-type rules are loaded from resources, not duplicated in the main skill.
- [ ] Manager handoff includes task count, parallel groups, blockers, resources, and final checks.
