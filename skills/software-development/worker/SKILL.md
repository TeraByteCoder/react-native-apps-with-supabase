---
name: worker
description: "Use inside manager-dispatched subagents to execute one bounded worker task using the shared templates/resources and return concrete verification evidence."
version: 1.2.0
author: Lukas
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [worker, subagent, execution, implementation, verification]
    related_skills: [planner, manager]
---

# Worker Skill

## Overview

The worker skill describes how a manager-dispatched subagent works. A worker receives one bounded task from the manager, implements or checks it, verifies the result, and reports evidence back.

There is no separate builder role. Worker subagents do implementation, documentation, validation, or packaging work. The manager coordinates them; the planner creates the prototype-derived worker plan.

Worker-specific categories and best practices are intentionally stored as resources, not duplicated in this `SKILL.md`:

- `../planner/resources/worker-types.md`
- `../planner/resources/best-practices.md`
- `../planner/resources/tech-stack.md`
- `../planner/resources/cdd.md`
- `../planner/resources/verification-checklist.md`

Use `templates/worker-report-template.md` for the result format.

## When to Use

- Manager gives a worker subagent one planner-created worker task.
- A small implementation task must be executed.
- A focused validation, documentation, packaging, or file-generation task is needed.
- A previous worker result needs a targeted fix.

Do not use worker for broad planning or orchestration. Use planner and manager for those roles.

## Worker Contract

Every worker receives:

- task id and title,
- prototype source or reason for the task,
- worker type from `worker-types.md`,
- acceptance checks,
- affected paths,
- constraints and relevant resources,
- required verification,
- return format.

The worker must stay inside that contract. If the task is impossible or unclear, report a blocker instead of guessing.

## Execution Steps

1. Read the assigned task and relevant resource excerpts.
2. Confirm affected paths and file boundaries.
3. Make the smallest required change.
4. Follow worker-type best practices from resources.
5. Run the requested verification.
6. If verification fails and the fix is within scope, fix and rerun.
7. Report the result using `templates/worker-report-template.md`.

## Resource Rules

- UI workers use both `cdd.md` and `tech-stack.md`.
- Backend workers use `tech-stack.md` and backend entries from `best-practices.md`.
- Docs, validation, and packaging workers use only the resource sections relevant to their task.
- Do not merge CDD guidance into tech-stack notes.
- Do not invent a new worker category if `worker-types.md` already covers it.

## Required Return Format

Use `templates/worker-report-template.md` exactly. Include command output or a concrete blocker for every verification item.

## Common Pitfalls

1. Expanding scope beyond the assigned task.
2. Forgetting Storybook for reusable UI work.
3. Reporting success without running verification.
4. Editing files outside affected paths without manager approval.
5. Hiding blockers or failed commands.
6. Acting like a manager instead of a focused worker.
7. Ignoring the separated resources and mixing CDD, tech stack, and worker rules together.

## Verification Checklist

Use the shared checklist in `../planner/resources/verification-checklist.md` and confirm:

- [ ] One bounded task was executed.
- [ ] Affected paths were respected.
- [ ] Relevant templates/resources were used.
- [ ] Verification command was run or blocker was reported.
- [ ] Changed files are listed.
- [ ] Acceptance-check status is explicit.
- [ ] Result is ready for manager review.
