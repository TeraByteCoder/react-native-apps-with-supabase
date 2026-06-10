---
name: manager
description: "Use when multiple planner, builder, and worker tasks must be coordinated, reviewed, packaged, and checked against the assignment deliverables."
version: 1.0.0
author: Lukas
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [coordination, review, deliverables, workflow, quality-gate]
    related_skills: [planner, builder, worker]
---

# Manager Skill

## Overview

The manager skill coordinates the full assignment workflow. It keeps the backlog, implementation, verification, documentation, and handoff aligned. It is responsible for deciding which skill should be used next and for checking that the final deliverable is complete.

Use this skill as the control layer after planner creates stories and before final submission. Manager does not replace builder or worker; it routes work to them and verifies their outputs.

## When to Use

- Several user stories or tasks must be coordinated.
- The repository needs a deliverables check before submission.
- Skill outputs must be reviewed for consistency.
- The final ZIP or documentation must include the required artifacts.
- A task touches multiple areas such as apps, packages, Supabase, docs, and skills.

Do not use this skill for isolated implementation. Use builder for code creation and worker for narrow execution tasks.

## Responsibilities

Manager owns these activities:

1. Read the assignment, README, and existing repository status.
2. Confirm the active backlog from planner.
3. Assign implementation stories to builder or worker.
4. Check that each result has evidence: changed files, command output, tests, or manual verification notes.
5. Keep documentation up to date, especially usage instructions for the skills.
6. Prepare the final handoff or submission checklist.

## Coordination Flow

```text
1. Planner creates user stories and acceptance criteria.
2. Manager reviews scope and orders the work.
3. Builder implements app, package, Storybook, or Supabase code.
4. Worker performs focused support tasks such as parsing, file generation, checks, or packaging.
5. Manager runs quality gates and documents the result.
```

## Assignment Deliverable Checklist

For this repository, check at minimum:

- `skills/software-development/planner/SKILL.md` exists.
- `skills/software-development/manager/SKILL.md` exists.
- `skills/software-development/builder/SKILL.md` exists.
- `skills/software-development/worker/SKILL.md` exists.
- Each skill has Hermes-style YAML frontmatter.
- Each skill has Overview, When to Use, actionable workflow, Common Pitfalls, and Verification Checklist.
- Usage instructions exist in project documentation.
- `npm run check-types` still passes when code was changed.
- Any generated ZIP contains the relevant skills and docs.

## Review Questions

Before marking work done, answer:

- Did the implementation satisfy the exact requested scope?
- Are there exactly four role skills for planner, manager, builder, and worker?
- Is each skill understandable without the chat history?
- Does the usage documentation explain the order and purpose of the skills?
- Are there unverified claims in the final answer?

## Common Pitfalls

1. Letting one skill do everything. Keep planning, coordination, building, and focused work separate.
2. Skipping evidence. Manager should not accept "done" without command output or file checks.
3. Forgetting documentation. A skill set is incomplete if users do not know how to use it.
4. Overwriting assignment files unnecessarily. Make minimal, targeted changes.
5. Packaging stale files. Rebuild the submission ZIP after changing skills.

## Verification Checklist

- [ ] Four role skills exist and are named planner, manager, builder, and worker.
- [ ] Skill frontmatter validates and descriptions are under 1024 characters.
- [ ] Usage documentation explains the workflow.
- [ ] Git status and changed files were reviewed.
- [ ] Required checks or packaging commands were run.
- [ ] Final response lists real verification results.
