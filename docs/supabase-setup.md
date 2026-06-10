# Supabase setup

This repository is prepared to read workout demo content from Supabase without committing any secrets.

## Public Expo environment variables

Copy the relevant example file and provide a real public anon key locally:

- `apps/workout-app/.env.example`
- `apps/admin-app/.env.example`

Expected variables:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://xlwvsmqjwmurwlmlvqdy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Only the project URL and placeholder anon key are committed. Do not commit access tokens, service-role keys, personal access tokens, or real local `.env` files.

## Current project status

The linked Supabase project ref is `xlwvsmqjwmurwlmlvqdy`. It is currently paused, so remote deploys, database pushes, and live REST reads are blocked until the project is unpaused in Supabase.

After unpausing, create or verify a `public.workouts` table that is readable with the anon key according to the desired RLS policy. The shared loader calls:

```text
GET /rest/v1/workouts?select=*
```

with the `apikey` header and the matching public authorization header.

## App-side fallback behavior

`@workout/shared-utils` exports mocked workout tracking data and `loadWorkoutTrackingData()`. The loader reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from Expo/public environment variables when explicit env values are not passed. If either value is missing, the anon key is still a placeholder, fetch is unavailable, the project is paused, or the REST request fails, it returns safe mock workout dashboard data instead of throwing.
