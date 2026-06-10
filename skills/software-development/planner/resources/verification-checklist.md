# Shared Verification Checklist

Use this same checklist from planner, manager, and worker instead of duplicating inconsistent checks.

## Skill Structure

- [ ] `SKILL.md` has valid frontmatter and required sections.
- [ ] Reusable templates live in `templates/`.
- [ ] Specific guidance lives in `resources/`.
- [ ] CDD and tech-stack guidance are separate files.
- [ ] Worker specialization is in `resources/worker-types.md`.

## Planner Output

- [ ] Planner creates a prototype-derived worker plan, not direct final user stories as primary output.
- [ ] Every worker task has affected paths, dependencies, acceptance checks, and verification.
- [ ] Manager handoff includes parallel groups and blockers.

## Manager Execution

- [ ] Every worker receives exactly one bounded task.
- [ ] Parallel workers do not edit the same files.
- [ ] Worker reports include changed files and verification evidence.
- [ ] Final checks run before commit/push when requested.

## Worker Execution

- [ ] Scope stayed inside assigned paths.
- [ ] Relevant resources were followed.
- [ ] Verification ran or blocker was explicit.
- [ ] Acceptance-check status is explicit.
