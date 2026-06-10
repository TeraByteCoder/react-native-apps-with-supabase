---
name: manager
description: "Use when planner-created user stories must be managed by dispatching worker subagents with delegate_task, collecting their results, reviewing them, and preparing the final handoff."
version: 1.1.0
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

The manager skill is the orchestration role. It takes the planner backlog and manages worker subagents. The manager does not do all implementation itself. It gives individual user stories to worker subagents, collects results, checks evidence, asks for fixes when needed, and performs the final integration review.

This skill is intentionally built around subagents. In Hermes, the manager uses `delegate_task` to run focused worker agents with isolated context.

## When to Use

- Planner has produced user stories and they need execution.
- Multiple stories should be given to separate workers.
- Work can be parallelized safely.
- Results from workers must be reviewed and integrated.
- A final check, commit, ZIP, or push is needed.

Do not use manager to invent the backlog from scratch. Use planner first.
Do not create a separate builder role. Implementation is done by worker subagents.

## Manager Responsibilities

1. Read the planner output.
2. Decide which stories can run in parallel and which must be sequential.
3. Dispatch each story to one worker subagent using `delegate_task`.
4. Give every worker the exact story text, affected paths, constraints, and verification command.
5. Require workers to return changed files, verification output, and blockers.
6. Run or request review checks after worker results.
7. Ask a worker subagent for fixes if a story is incomplete.
8. Perform final repository checks and prepare commit/push or submission.

## Subagent Dispatch Pattern

Use this pattern for one story:

```python
delegate_task(
    goal="Execute US-01: <story title>",
    context="""
    You are a worker subagent for the workout platform repository.

    STORY:
    <paste the full planner story here>

    RULES:
    - Stay inside the affected paths unless the story requires more.
    - Do not invent extra scope.
    - If reusable UI is touched, add or update Storybook stories.
    - If Supabase is touched, keep Edge Functions as orchestration and SQL Functions as domain logic.
    - Run the verification listed in the story when possible.

    RETURN FORMAT:
    - Summary
    - Changed files
    - Verification command and exact result
    - Blockers or follow-up needed
    """,
    toolsets=["terminal", "file"]
)
```

## Parallel Dispatch Pattern

When stories do not touch the same files, the manager may dispatch them in parallel:

```python
delegate_task(tasks=[
    {
        "goal": "Execute US-01: shared button component",
        "context": "<full story, paths, verification, return format>",
        "toolsets": ["terminal", "file"]
    },
    {
        "goal": "Execute US-02: README usage docs",
        "context": "<full story, paths, verification, return format>",
        "toolsets": ["terminal", "file"]
    }
])
```

Do not run stories in parallel when they edit the same files. Sequence them instead.

## Review Loop

After each worker result:

1. Check changed files with `git status --short`.
2. Read or inspect important changed files.
3. Run the story verification if the worker did not prove it.
4. If acceptance criteria are not met, dispatch a fix worker with the exact gaps.
5. Continue only when the story is complete.

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

For this assignment, the expected role skills are exactly:

- `skills/software-development/planner/SKILL.md`
- `skills/software-development/manager/SKILL.md`
- `skills/software-development/worker/SKILL.md`

There is no `builder` skill in this version. Worker subagents are responsible for implementation.

## Common Pitfalls

1. Doing worker tasks manually instead of delegating them.
2. Sending a worker vague context instead of the full user story.
3. Running conflicting workers in parallel on the same files.
4. Accepting worker output without verification.
5. Forgetting to document how the subagent workflow is executed.
6. Keeping a builder role even though implementation belongs to workers.

## Verification Checklist

- [ ] Planner backlog exists before manager dispatches workers.
- [ ] Each worker subagent receives one clear story or bounded task.
- [ ] Parallel workers do not edit the same files.
- [ ] Worker outputs include changed files and verification evidence.
- [ ] Incomplete stories go through a fix-worker loop.
- [ ] Final checks, commit, and push are completed when requested.
