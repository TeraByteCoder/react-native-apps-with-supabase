import React from 'react';

import { WorkoutTrackingDashboard, type WorkoutTrackingDashboardProps } from '../src';

const baseArgs: WorkoutTrackingDashboardProps = {
  athleteName: 'Maya Chen',
  workoutTitle: 'Lower Body Strength + Engine',
  workoutSubtitle: 'Week 4 • Day 2 • 48 min planned',
  syncState: 'synced',
  lastSyncedAt: 'Today, 08:42',
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
      label: 'workout_sets row updated for Back Squat set 3',
      timestamp: '08:42:16 • public.workout_sets',
      status: 'success'
    },
    {
      id: 'event-2',
      label: 'volume aggregate recalculated in local mock store',
      timestamp: '08:42:12 • edge function preview',
      status: 'success'
    },
    {
      id: 'event-3',
      label: 'Realtime subscription listening for workout_logs changes',
      timestamp: '08:41:58 • channel: athlete:Maya',
      status: 'pending'
    }
  ]
};

const meta = {
  title: 'Workout/WorkoutTrackingDashboard',
  component: WorkoutTrackingDashboard,
  args: baseArgs,
  parameters: {
    layout: 'fullscreen'
  }
};

export default meta;

export const Synced = {};

export const Syncing = {
  args: {
    syncState: 'syncing',
    lastSyncedAt: 'Sync in progress…',
    completedSets: 10,
    totalSets: 12,
    totalVolumeKg: 7020,
    events: [
      {
        id: 'event-syncing-1',
        label: 'Queued workout_sets update for Bike Sprint interval 4',
        timestamp: 'Now • pending mutation',
        status: 'pending'
      },
      {
        id: 'event-syncing-2',
        label: 'Uploading cached workout_logs changes to Supabase',
        timestamp: 'Now • mock sync worker',
        status: 'pending'
      },
      {
        id: 'event-syncing-3',
        label: 'Previous strength sets confirmed by Realtime',
        timestamp: '08:42:16 • public.workout_sets',
        status: 'success'
      }
    ]
  }
};

export const Offline = {
  args: {
    syncState: 'offline',
    lastSyncedAt: 'Yesterday, 19:18',
    events: [
      {
        id: 'event-offline-1',
        label: 'Showing mocked local cache because Supabase credentials are not configured',
        timestamp: 'Now • local preview mode',
        status: 'warning'
      },
      {
        id: 'event-offline-2',
        label: 'Set completion saved locally for retry',
        timestamp: '08:44:03 • mock offline queue',
        status: 'pending'
      },
      {
        id: 'event-offline-3',
        label: 'Last successful remote snapshot loaded',
        timestamp: 'Yesterday, 19:18 • public.workout_logs',
        status: 'success'
      }
    ]
  }
};

export const Error = {
  args: {
    syncState: 'error',
    lastSyncedAt: 'Retry failed at 08:45',
    events: [
      {
        id: 'event-error-1',
        label: 'Mock Supabase insert rejected: missing anon key in Storybook environment',
        timestamp: '08:45:01 • preview-only error',
        status: 'error'
      },
      {
        id: 'event-error-2',
        label: 'Workout progress remains visible from mocked fallback data',
        timestamp: '08:45:01 • fallback cache',
        status: 'warning'
      },
      {
        id: 'event-error-3',
        label: 'Retry action can be wired once real credentials are available',
        timestamp: '08:45:00 • UI review note',
        status: 'pending'
      }
    ]
  }
};
