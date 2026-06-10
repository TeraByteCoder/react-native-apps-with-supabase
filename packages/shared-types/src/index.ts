export type WorkoutDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface WorkoutSummary {
  id: string;
  title: string;
  durationInMinutes: number;
  difficulty: WorkoutDifficulty;
}

export type SupabaseSyncState = 'synced' | 'syncing' | 'offline' | 'error';

export type WorkoutEventStatus = 'success' | 'pending' | 'warning' | 'error';

export interface WorkoutSetProgress {
  id: string;
  exercise: string;
  targetReps: number;
  completedReps: number;
  weightKg: number;
  completed: boolean;
}

export interface WeeklyWorkoutProgress {
  label: string;
  completedWorkouts: number;
  plannedWorkouts: number;
}

export interface SupabaseWorkoutEvent {
  id: string;
  label: string;
  timestamp: string;
  status: WorkoutEventStatus;
}

export interface WorkoutTrackingDashboardData {
  athleteName: string;
  workoutTitle: string;
  workoutSubtitle: string;
  syncState: SupabaseSyncState;
  lastSyncedAt: string;
  completedSets: number;
  totalSets: number;
  totalVolumeKg: number;
  sets: WorkoutSetProgress[];
  weeklyProgress: WeeklyWorkoutProgress[];
  events: SupabaseWorkoutEvent[];
}

export interface SupabaseWorkoutRow {
  id: string | number;
  title?: string | null;
  name?: string | null;
  athlete_name?: string | null;
  subtitle?: string | null;
  duration_minutes?: number | null;
  duration_in_minutes?: number | null;
  difficulty?: WorkoutDifficulty | string | null;
  completed_sets?: number | null;
  total_sets?: number | null;
  total_volume_kg?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

export type WorkoutTrackingDataSource = 'supabase' | 'mock';

export interface WorkoutTrackingLoadResult {
  source: WorkoutTrackingDataSource;
  data: WorkoutTrackingDashboardData;
  workouts: SupabaseWorkoutRow[];
  error?: string;
}
