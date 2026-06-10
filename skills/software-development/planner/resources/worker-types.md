# Worker Types Resource

Use these worker types so manager can dispatch the right subagent. Do not define additional role skills for each worker; keep worker specialization here.

## ui-worker

Handles React Native UI, shared components, design system, Storybook stories, and prototype-to-component translation.

Rules:
- Use React Native primitives and project theme conventions.
- Extract reusable UI only when it is reused or clearly component-worthy.
- Add or update Storybook stories when reusable UI changes.
- Respect CDD resource guidance.

## backend-worker

Handles Supabase Edge Functions, SQL Functions, migrations, RLS, and backend integration.

Rules:
- Edge Functions validate and orchestrate requests.
- SQL Functions hold domain logic and transactional rules.
- RLS policies protect data access.
- Do not hardcode real credentials.

## docs-worker

Handles README, usage documentation, assignment notes, and workflow descriptions.

Rules:
- Make docs executable and concrete.
- Include paths and commands.
- Avoid vague process text.

## validation-worker

Handles checks, review tasks, skill validation, and repository sanity checks.

Rules:
- Run the exact command requested by manager.
- Report exact output, counts, and failures.
- Do not change source unless asked for a fix.

## packaging-worker

Handles submission ZIPs, generated artifacts, and final delivery folders.

Rules:
- Rebuild artifacts after source changes.
- List ZIP contents.
- Verify required files are included.
