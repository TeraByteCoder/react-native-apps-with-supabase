import { StyleSheet, Text, View } from 'react-native';

import { kineticTheme } from './kineticTheme';

export type SupabaseSyncState = 'synced' | 'syncing' | 'offline' | 'error';

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
  status: 'success' | 'pending' | 'warning' | 'error';
}

export interface WorkoutTrackingDashboardProps {
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

const syncCopy: Record<SupabaseSyncState, { label: string; detail: string; color: string; backgroundColor: string }> = {
  synced: {
    label: 'Supabase synced',
    detail: 'Mock rows are current with the remote workout_logs table.',
    color: kineticTheme.colors.onPrimary,
    backgroundColor: kineticTheme.colors.primary
  },
  syncing: {
    label: 'Supabase syncing',
    detail: 'Mock mutations are queued and uploading to Supabase Realtime.',
    color: kineticTheme.colors.onPrimary,
    backgroundColor: kineticTheme.colors.secondary
  },
  offline: {
    label: 'Supabase offline',
    detail: 'Mock local cache is shown until credentials/network are available.',
    color: kineticTheme.colors.onSurface,
    backgroundColor: kineticTheme.colors.surfaceBright
  },
  error: {
    label: 'Supabase sync error',
    detail: 'Mock error state: review retry messaging before real credentials are connected.',
    color: kineticTheme.colors.background,
    backgroundColor: kineticTheme.colors.error
  }
};

const eventColors: Record<SupabaseWorkoutEvent['status'], string> = {
  success: kineticTheme.colors.primary,
  pending: kineticTheme.colors.secondary,
  warning: kineticTheme.colors.tertiary,
  error: kineticTheme.colors.error
};

function formatVolume(volumeKg: number) {
  return `${volumeKg.toLocaleString()} kg`;
}

function getSetVolume(set: WorkoutSetProgress) {
  return set.completedReps * set.weightKg;
}

export function WorkoutTrackingDashboard({
  athleteName,
  workoutTitle,
  workoutSubtitle,
  syncState,
  lastSyncedAt,
  completedSets,
  totalSets,
  totalVolumeKg,
  sets,
  weeklyProgress,
  events
}: WorkoutTrackingDashboardProps) {
  const sync = syncCopy[syncState];
  const completionPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <View style={styles.dashboard}>
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTextColumn}>
            <Text style={styles.eyebrow}>Workout tracking</Text>
            <Text style={styles.title}>Today&apos;s workout</Text>
            <Text style={styles.subtitle}>{athleteName} • {workoutSubtitle}</Text>
          </View>
          <View style={[styles.syncBadge, { backgroundColor: sync.backgroundColor }]}>
            <Text style={[styles.syncBadgeText, { color: sync.color }]}>{sync.label}</Text>
          </View>
        </View>

        <View style={styles.workoutPanel}>
          <View style={styles.workoutTitleRow}>
            <View>
              <Text style={styles.panelLabel}>Active session</Text>
              <Text style={styles.workoutTitle}>{workoutTitle}</Text>
            </View>
            <Text style={styles.completionText}>{completionPercent}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
          </View>
          <Text style={styles.syncDetail}>{sync.detail}</Text>
          <Text style={styles.lastSynced}>Last mocked Supabase sync: {lastSyncedAt}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{completedSets}/{totalSets}</Text>
          <Text style={styles.metricLabel}>Completed sets</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{formatVolume(totalVolumeKg)}</Text>
          <Text style={styles.metricLabel}>Total volume</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{weeklyProgress.reduce((total, day) => total + day.completedWorkouts, 0)}</Text>
          <Text style={styles.metricLabel}>Weekly sessions</Text>
        </View>
      </View>

      <View style={styles.contentGrid}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Today&apos;s completed sets</Text>
          <View style={styles.setList}>
            {sets.map((set) => (
              <View key={set.id} style={styles.setRow}>
                <View style={[styles.setStatusDot, set.completed ? styles.setStatusDone : styles.setStatusOpen]} />
                <View style={styles.setTextColumn}>
                  <Text style={styles.setExercise}>{set.exercise}</Text>
                  <Text style={styles.setDetail}>{set.completedReps}/{set.targetReps} reps • {set.weightKg} kg • {formatVolume(getSetVolume(set))}</Text>
                </View>
                <Text style={set.completed ? styles.setStateDone : styles.setStateOpen}>{set.completed ? 'Done' : 'Open'}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Weekly progress</Text>
          <View style={styles.weekList}>
            {weeklyProgress.map((day) => {
              const dayPercent = day.plannedWorkouts > 0 ? (day.completedWorkouts / day.plannedWorkouts) * 100 : 0;

              return (
                <View key={day.label} style={styles.weekRow}>
                  <Text style={styles.weekLabel}>{day.label}</Text>
                  <View style={styles.weekTrack}>
                    <View style={[styles.weekFill, { width: `${Math.min(dayPercent, 100)}%` }]} />
                  </View>
                  <Text style={styles.weekValue}>{day.completedWorkouts}/{day.plannedWorkouts}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Supabase sync/events</Text>
        <View style={styles.eventList}>
          {events.map((event) => (
            <View key={event.id} style={styles.eventRow}>
              <View style={[styles.eventDot, { backgroundColor: eventColors[event.status] }]} />
              <View style={styles.eventTextColumn}>
                <Text style={styles.eventLabel}>{event.label}</Text>
                <Text style={styles.eventTime}>{event.timestamp}</Text>
              </View>
              <Text style={styles.eventStatus}>{event.status}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboard: {
    width: '100%',
    maxWidth: 1120,
    backgroundColor: kineticTheme.colors.background,
    padding: kineticTheme.spacing.lg,
    gap: kineticTheme.spacing.lg
  },
  headerCard: {
    backgroundColor: kineticTheme.colors.surfaceContainer,
    borderColor: kineticTheme.colors.outlineVariant,
    borderRadius: kineticTheme.radius.xl,
    borderWidth: 1,
    padding: kineticTheme.spacing.lg,
    gap: kineticTheme.spacing.lg
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: kineticTheme.spacing.md,
    flexWrap: 'wrap'
  },
  headerTextColumn: {
    gap: kineticTheme.spacing.xs,
    flex: 1,
    minWidth: 260
  },
  eyebrow: {
    ...kineticTheme.typography.labelCaps,
    color: kineticTheme.colors.primary
  },
  title: {
    ...kineticTheme.typography.displayXL,
    color: kineticTheme.colors.onBackground
  },
  subtitle: {
    ...kineticTheme.typography.bodyBase,
    color: kineticTheme.colors.onSurfaceVariant
  },
  syncBadge: {
    borderRadius: kineticTheme.radius.pill,
    paddingHorizontal: kineticTheme.spacing.md,
    paddingVertical: kineticTheme.spacing.sm
  },
  syncBadgeText: {
    ...kineticTheme.typography.labelCaps
  },
  workoutPanel: {
    backgroundColor: kineticTheme.colors.surfaceContainerHigh,
    borderRadius: kineticTheme.radius.lg,
    padding: kineticTheme.spacing.lg,
    gap: kineticTheme.spacing.sm
  },
  workoutTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: kineticTheme.spacing.md
  },
  panelLabel: {
    ...kineticTheme.typography.labelCaps,
    color: kineticTheme.colors.outline
  },
  workoutTitle: {
    ...kineticTheme.typography.headlineLG,
    color: kineticTheme.colors.onSurface
  },
  completionText: {
    ...kineticTheme.typography.headlineLG,
    color: kineticTheme.colors.primary
  },
  progressTrack: {
    height: 12,
    backgroundColor: kineticTheme.colors.surfaceVariant,
    borderRadius: kineticTheme.radius.pill,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: kineticTheme.colors.primary,
    borderRadius: kineticTheme.radius.pill
  },
  syncDetail: {
    ...kineticTheme.typography.bodySM,
    color: kineticTheme.colors.onSurface
  },
  lastSynced: {
    ...kineticTheme.typography.bodySM,
    color: kineticTheme.colors.onSurfaceVariant
  },
  metricsRow: {
    flexDirection: 'row',
    gap: kineticTheme.spacing.md,
    flexWrap: 'wrap'
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: kineticTheme.colors.surfaceContainerLow,
    borderColor: kineticTheme.colors.outlineVariant,
    borderRadius: kineticTheme.radius.lg,
    borderWidth: 1,
    padding: kineticTheme.spacing.lg,
    gap: kineticTheme.spacing.xs
  },
  metricValue: {
    ...kineticTheme.typography.headlineLG,
    color: kineticTheme.colors.primary
  },
  metricLabel: {
    ...kineticTheme.typography.bodySM,
    color: kineticTheme.colors.onSurfaceVariant
  },
  contentGrid: {
    flexDirection: 'row',
    gap: kineticTheme.spacing.lg,
    flexWrap: 'wrap'
  },
  sectionCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: kineticTheme.colors.surfaceContainer,
    borderColor: kineticTheme.colors.outlineVariant,
    borderRadius: kineticTheme.radius.lg,
    borderWidth: 1,
    padding: kineticTheme.spacing.lg,
    gap: kineticTheme.spacing.md
  },
  sectionTitle: {
    ...kineticTheme.typography.titleMD,
    color: kineticTheme.colors.onSurface
  },
  setList: {
    gap: kineticTheme.spacing.sm
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: kineticTheme.spacing.sm,
    backgroundColor: kineticTheme.colors.surfaceContainerHigh,
    borderRadius: kineticTheme.radius.md,
    padding: kineticTheme.spacing.md
  },
  setStatusDot: {
    width: 12,
    height: 12,
    borderRadius: kineticTheme.radius.pill
  },
  setStatusDone: {
    backgroundColor: kineticTheme.colors.primary
  },
  setStatusOpen: {
    backgroundColor: kineticTheme.colors.outline
  },
  setTextColumn: {
    flex: 1,
    gap: 2
  },
  setExercise: {
    ...kineticTheme.typography.bodyBase,
    color: kineticTheme.colors.onSurface
  },
  setDetail: {
    ...kineticTheme.typography.bodySM,
    color: kineticTheme.colors.onSurfaceVariant
  },
  setStateDone: {
    ...kineticTheme.typography.labelCaps,
    color: kineticTheme.colors.primary
  },
  setStateOpen: {
    ...kineticTheme.typography.labelCaps,
    color: kineticTheme.colors.outline
  },
  weekList: {
    gap: kineticTheme.spacing.sm
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: kineticTheme.spacing.sm
  },
  weekLabel: {
    ...kineticTheme.typography.bodySM,
    width: 42,
    color: kineticTheme.colors.onSurface
  },
  weekTrack: {
    flex: 1,
    height: 10,
    backgroundColor: kineticTheme.colors.surfaceVariant,
    borderRadius: kineticTheme.radius.pill,
    overflow: 'hidden'
  },
  weekFill: {
    height: '100%',
    backgroundColor: kineticTheme.colors.tertiary,
    borderRadius: kineticTheme.radius.pill
  },
  weekValue: {
    ...kineticTheme.typography.bodySM,
    width: 42,
    textAlign: 'right',
    color: kineticTheme.colors.onSurfaceVariant
  },
  eventList: {
    gap: kineticTheme.spacing.sm
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: kineticTheme.spacing.sm,
    backgroundColor: kineticTheme.colors.surfaceContainerHigh,
    borderRadius: kineticTheme.radius.md,
    padding: kineticTheme.spacing.md
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: kineticTheme.radius.pill
  },
  eventTextColumn: {
    flex: 1,
    gap: 2
  },
  eventLabel: {
    ...kineticTheme.typography.bodyBase,
    color: kineticTheme.colors.onSurface
  },
  eventTime: {
    ...kineticTheme.typography.bodySM,
    color: kineticTheme.colors.onSurfaceVariant
  },
  eventStatus: {
    ...kineticTheme.typography.labelCaps,
    color: kineticTheme.colors.onSurfaceVariant
  }
});
