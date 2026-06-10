import type {
  SupabaseWorkoutRow,
  WorkoutTrackingDashboardData,
  WorkoutTrackingLoadResult
} from '@workout/shared-types';

export function formatWorkoutDuration(durationInMinutes: number): string {
  if (durationInMinutes < 60) {
    return `${durationInMinutes} min`;
  }

  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export interface SupabasePublicEnv {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
}

type FetchLike = (input: string, init?: { headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
}>;

interface LoadWorkoutTrackingOptions {
  env?: SupabasePublicEnv;
  fetcher?: FetchLike;
}

const placeholderAnonKeys = new Set(['', 'your-anon-key-here', '<your-anon-key>', '[your-anon-key]']);

export const mockWorkoutTrackingData: WorkoutTrackingDashboardData = {
  athleteName: 'Maya Chen',
  workoutTitle: 'Lower Body Strength + Engine',
  workoutSubtitle: 'Week 4 • Day 2 • 48 min planned',
  syncState: 'offline',
  lastSyncedAt: 'Demo data • Supabase not connected',
  completedSets: 9,
  totalSets: 12,
  totalVolumeKg: 6420,
  sets: [
    {
      id: 'set-1',
      exercise: 'Back Squat',
      targetReps: 5,
      completedReps: 5,
      weightKg: 100,
      completed: true
    },
    {
      id: 'set-2',
      exercise: 'Romanian Deadlift',
      targetReps: 8,
      completedReps: 8,
      weightKg: 72.5,
      completed: true
    },
    {
      id: 'set-3',
      exercise: 'Walking Lunge',
      targetReps: 20,
      completedReps: 20,
      weightKg: 24,
      completed: true
    },
    {
      id: 'set-4',
      exercise: 'Bike Sprint Finisher',
      targetReps: 6,
      completedReps: 3,
      weightKg: 0,
      completed: false
    }
  ],
  weeklyProgress: [
    { label: 'Mon', completedWorkouts: 1, plannedWorkouts: 1 },
    { label: 'Tue', completedWorkouts: 1, plannedWorkouts: 1 },
    { label: 'Wed', completedWorkouts: 0, plannedWorkouts: 1 },
    { label: 'Thu', completedWorkouts: 0, plannedWorkouts: 1 },
    { label: 'Fri', completedWorkouts: 0, plannedWorkouts: 1 },
    { label: 'Sat', completedWorkouts: 0, plannedWorkouts: 0 },
    { label: 'Sun', completedWorkouts: 0, plannedWorkouts: 0 }
  ],
  events: [
    {
      id: 'event-1',
      label: 'Demo workout cache loaded while Supabase credentials are unavailable',
      timestamp: 'Now • local fallback',
      status: 'warning'
    },
    {
      id: 'event-2',
      label: 'public.workouts REST loader is ready for anon-key access',
      timestamp: 'Setup note • Supabase REST',
      status: 'pending'
    },
    {
      id: 'event-3',
      label: 'Project xlwvsmqjwmurwlmlvqdy must be unpaused before remote reads succeed',
      timestamp: 'Setup note • Supabase project',
      status: 'warning'
    }
  ]
};

export const mockSupabaseWorkoutRows: SupabaseWorkoutRow[] = [
  {
    id: 'demo-lower-body-strength',
    title: mockWorkoutTrackingData.workoutTitle,
    athlete_name: mockWorkoutTrackingData.athleteName,
    subtitle: mockWorkoutTrackingData.workoutSubtitle,
    duration_minutes: 48,
    difficulty: 'Intermediate',
    completed_sets: mockWorkoutTrackingData.completedSets,
    total_sets: mockWorkoutTrackingData.totalSets,
    total_volume_kg: mockWorkoutTrackingData.totalVolumeKg,
    updated_at: 'demo'
  }
];

export async function loadWorkoutTrackingData(
  options: LoadWorkoutTrackingOptions = {}
): Promise<WorkoutTrackingLoadResult> {
  const env = options.env ?? readPublicEnv();
  const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '');
  const anonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

  if (!supabaseUrl || placeholderAnonKeys.has(anonKey)) {
    return {
      source: 'mock',
      data: mockWorkoutTrackingData,
      workouts: mockSupabaseWorkoutRows,
      error: 'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY; using mock workout data.'
    };
  }

  const fetcher = options.fetcher ?? getGlobalFetch();

  if (!fetcher) {
    return {
      source: 'mock',
      data: mockWorkoutTrackingData,
      workouts: mockSupabaseWorkoutRows,
      error: 'No fetch implementation is available; using mock workout data.'
    };
  }

  try {
    const workouts = await fetchPublicWorkouts({ supabaseUrl, anonKey, fetcher });

    if (workouts.length === 0) {
      return {
        source: 'mock',
        data: mockWorkoutTrackingData,
        workouts: [],
        error: 'Supabase public.workouts returned no rows; using mock workout data.'
      };
    }

    return {
      source: 'supabase',
      data: mapWorkoutRowToDashboardData(workouts[0]),
      workouts
    };
  } catch (error) {
    return {
      source: 'mock',
      data: mockWorkoutTrackingData,
      workouts: mockSupabaseWorkoutRows,
      error: error instanceof Error ? error.message : 'Unable to load Supabase workouts; using mock workout data.'
    };
  }
}

export async function fetchPublicWorkouts({
  supabaseUrl,
  anonKey,
  fetcher = getGlobalFetch()
}: {
  supabaseUrl: string;
  anonKey: string;
  fetcher?: FetchLike;
}): Promise<SupabaseWorkoutRow[]> {
  if (!fetcher) {
    throw new Error('No fetch implementation is available.');
  }

  const response = await fetcher(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/workouts?select=*`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase public.workouts request failed (${response.status} ${response.statusText}).`);
  }

  const json = await response.json();

  if (!Array.isArray(json)) {
    throw new Error('Supabase public.workouts response was not an array.');
  }

  return json.filter(isSupabaseWorkoutRow);
}

function mapWorkoutRowToDashboardData(row: SupabaseWorkoutRow): WorkoutTrackingDashboardData {
  const workoutTitle = readString(row.title) ?? readString(row.name) ?? mockWorkoutTrackingData.workoutTitle;
  const athleteName = readString(row.athlete_name) ?? mockWorkoutTrackingData.athleteName;
  const duration = readNumber(row.duration_minutes) ?? readNumber(row.duration_in_minutes);
  const workoutSubtitle = readString(row.subtitle) ?? (duration ? `${formatWorkoutDuration(duration)} planned` : mockWorkoutTrackingData.workoutSubtitle);
  const completedSets = readNumber(row.completed_sets) ?? mockWorkoutTrackingData.completedSets;
  const totalSets = readNumber(row.total_sets) ?? Math.max(completedSets, mockWorkoutTrackingData.totalSets);
  const totalVolumeKg = readNumber(row.total_volume_kg) ?? mockWorkoutTrackingData.totalVolumeKg;
  const lastSyncedAt = readString(row.updated_at) ?? readString(row.created_at) ?? 'Supabase REST loaded';

  return {
    ...mockWorkoutTrackingData,
    athleteName,
    workoutTitle,
    workoutSubtitle,
    syncState: 'synced',
    lastSyncedAt,
    completedSets,
    totalSets,
    totalVolumeKg,
    events: [
      {
        id: `workout-${String(row.id)}-loaded`,
        label: `Loaded workout ${String(row.id)} from public.workouts`,
        timestamp: 'Supabase REST • public.workouts',
        status: 'success'
      },
      ...mockWorkoutTrackingData.events.slice(1)
    ]
  };
}

function isSupabaseWorkoutRow(value: unknown): value is SupabaseWorkoutRow {
  return typeof value === 'object' && value !== null && 'id' in value;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function readPublicEnv(): SupabasePublicEnv {
  const maybeGlobal = globalThis as typeof globalThis & {
    process?: { env?: SupabasePublicEnv };
  };

  return maybeGlobal.process?.env ?? {};
}

function getGlobalFetch(): FetchLike | undefined {
  const maybeGlobal = globalThis as typeof globalThis & {
    fetch?: FetchLike;
  };

  return maybeGlobal.fetch;
}
