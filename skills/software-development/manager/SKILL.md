---
name: manager
description: "Use when planner-created worker plans must be orchestrated with delegate_task subagents, reviewed with evidence, integrated, verified, committed, and pushed."
version: 1.2.0
author: Lukas
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [manager, subagents, delegate-task, orchestration, review]
    related_skills: [planner, worker]
---

# Manager Skill

## Overview

The manager skill is the orchestration role. It takes the planner's worker plan and manages worker subagents. The manager does not invent the plan from scratch and does not do all implementation manually.

The manager gives one bounded task to each worker subagent, includes the needed templates/resources, collects evidence, checks results, requests fixes, then performs the final integration review, commit, and push when requested.

The skill follows the AgentSkills.io-style split: reusable prompt shapes live in `templates/`; worker definitions, best practices, CDD, tech stack, and verification rules live in planner `resources/`.

## When to Use

- Planner has produced a worker plan from prototype/assignment input.
- Multiple tasks should be given to separate workers.
- Work can be parallelized safely.
- Results from workers must be reviewed and integrated.
- A final check, commit, ZIP, or push is needed.

Do not use manager to directly create the prototype plan. Use planner first.
Do not create a separate builder role. Implementation is done by worker subagents.

## Required Inputs

Manager needs:

- planner worker plan,
- `planner/resources/worker-types.md`,
- `planner/resources/tech-stack.md`,
- `planner/resources/cdd.md`,
- `planner/resources/verification-checklist.md`,
- `manager/templates/delegate-task-template.py`,
- `worker/templates/worker-report-template.md`.

## Manager Responsibilities

1. Read the planner output and referenced resources.
2. Decide which tasks can run in parallel and which must be sequential.
3. Dispatch each task to one worker subagent using `delegate_task`.
4. Give every worker the exact task text, affected paths, constraints, resource excerpts, and verification command.
5. Require workers to return changed files, verification output, acceptance status, and blockers.
6. Run or request review checks after worker results.
7. Ask a worker subagent for fixes if a task is incomplete.
8. Perform final repository checks.
9. Commit and push when requested by the user.

## Subagent Dispatch Pattern

Use `templates/delegate-task-template.py` as the source template for worker dispatch.

One worker gets one bounded task. Include only the resource sections that matter for that task plus the shared verification checklist.

## Parallel Dispatch Rules

Manager may dispatch tasks in parallel only when:

- affected files do not overlap,
- there is no dependency between the tasks,
- build or generated artifact outputs will not collide,
- each worker has a clear return format.

Do not run tasks in parallel when they edit the same files. Sequence them instead.

## Review Loop

After each worker result:

1. Check changed files with `git status --short`.
2. Read or inspect important changed files.
3. Run the task verification if the worker did not prove it.
4. Compare output against `planner/resources/verification-checklist.md`.
5. If acceptance checks are not met, dispatch a fix worker with the exact gaps.
6. Continue only when the task is complete.

## Final Execution Checklist

Before finishing:

```bash
git status --short
npm run check-types
python3 <skill-validation-script-if-relevant>
python3 <zip-content-check-if-relevant>
git add <changed-files>
git commit -m "<clear message>"
git push <remote> main
```

For this assignment, the role skills are:

- `skills/software-development/planner/SKILL.md`
- `skills/software-development/manager/SKILL.md`
- `skills/software-development/worker/SKILL.md`

Additional reusable material belongs in `templates/` and `resources/` under those skill directories, not as extra narrow role skills.

## Common Pitfalls

1. Doing worker tasks manually instead of delegating them.
2. Sending a worker vague context instead of the full planned task and relevant resources.
3. Running conflicting workers in parallel on the same files.
4. Accepting worker output without verification.
5. Mixing CDD and tech-stack rules into one context blob.
6. Keeping worker-type details in the main skill instead of resources.
7. Forgetting final commit and push when explicitly requested.

## Verification Checklist

Use the shared checklist in `planner/resources/verification-checklist.md` and confirm:

- [ ] Planner worker plan exists before manager dispatches workers.
- [ ] Each worker subagent receives one clear bounded task.
- [ ] Templates are loaded from `templates/`, not copied ad hoc.
- [ ] Worker type and best-practice rules are loaded from resources.
- [ ] Parallel workers do not edit the same files.
- [ ] Worker outputs include changed files and verification evidence.
- [ ] Incomplete tasks go through a fix-worker loop.
- [ ] Final checks, commit, and push are completed when requested.
