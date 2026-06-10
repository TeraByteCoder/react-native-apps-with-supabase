# Supabase setup

This repository is prepared to read workout demo content from Supabase without committing any secrets.

## Public Expo environment variables

Copy the relevant example file and provide a real public anon key locally:

- `apps/workout-app/.env.example`
- `apps/admin-app/.env.example`

Expected variables:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://kewjqrszymwwffymrkgq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Only the project URL and placeholder anon key are committed. Do not commit access tokens, service-role keys, personal access tokens, or real local `.env` files.

## Current project status

The linked Supabase project ref is `kewjqrszymwwffymrkgq` (`kinetic-coach-workout-demo`). It was created for this project via the Supabase CLI and is active. The experimental access token can create/link projects and list keys, but the current Supabase CLI rejects it for `db push` and `functions deploy` because those commands require the classic personal-access-token format. Until a compatible token or dashboard deploy is available, the app keeps a visible mock fallback and is ready to read public REST data once an anon key and schema are configured.

Next, create or verify a `public.workouts` table that is readable with the anon key according to the desired RLS policy. The shared loader calls:

```text
GET /rest/v1/workouts?select=*
```

with the `apikey` header and the matching public authorization header.

## App-side fallback behavior

`@workout/shared-utils` exports mocked workout tracking data and `loadWorkoutTrackingData()`. The loader reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from Expo/public environment variables when explicit env values are not passed. If either value is missing, the anon key is still a placeholder, fetch is unavailable, the project is paused, or the REST request fails, it returns safe mock workout dashboard data instead of throwing.
