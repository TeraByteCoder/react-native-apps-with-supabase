# Tech Stack Resource

Keep this separate from CDD. This file describes technologies and boundaries, not component-development workflow.

## Frontend

- React Native / Expo style cross-platform app structure.
- Shared components live in packages where reuse is needed.
- Storybook is used to preview and verify reusable UI components.

## Backend

- Supabase is the backend platform.
- Edge Functions are API/request orchestration boundaries.
- PostgreSQL SQL Functions hold domain/business logic and transactional behavior.
- RLS policies enforce data access.

## Tooling

- Use existing package scripts where available.
- Prefer `npm run check-types` for TypeScript verification when present.
- Do not commit credentials, `.env` secrets, or generated dependency folders.
