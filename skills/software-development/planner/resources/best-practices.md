# Specific Best Practices Resource

Use this resource for specific implementation advice that should not bloat `SKILL.md`.

## UI Best Practices

- Keep prototype fidelity high for layout hierarchy, spacing, and core interactions.
- Prefer project-level theme tokens if they exist.
- Do not over-extract components that are only used once.

## Supabase Best Practices

- Keep secrets out of source.
- Prefer database functions for transactional domain logic.
- Keep Edge Functions thin: validation, auth context, orchestration, response formatting.

## Documentation Best Practices

- Write steps that can be executed.
- Include exact paths and commands.
- Mention assumptions and blockers explicitly.

## Validation Best Practices

- Verify the changed scope, not only that files exist.
- Capture exact command results.
- If a check cannot run, explain the missing dependency or blocker.
