import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { WorkoutDifficulty } from '@workout/shared-types';
import { formatWorkoutDuration } from '@workout/shared-utils';

import { kineticTheme } from './kineticTheme';

export interface WorkoutCardProps {
  title: string;
  durationInMinutes: number;
  difficulty: WorkoutDifficulty;
  onPress?: () => void;
}

const difficultyColor: Record<WorkoutDifficulty, string> = {
  Beginner: '#86efac',
  Intermediate: kineticTheme.colors.primary,
  Advanced: '#fda4af'
};

export function WorkoutCard({ title, durationInMinutes, difficulty, onPress }: WorkoutCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.badge, { borderColor: difficultyColor[difficulty] }]}>
          <Text style={[styles.badgeText, { color: difficultyColor[difficulty] }]}>{difficulty}</Text>
        </View>
      </View>
      <Text style={styles.meta}>{formatWorkoutDuration(durationInMinutes)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: kineticTheme.colors.surfaceContainer,
    borderColor: kineticTheme.colors.outlineVariant,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: kineticTheme.colors.onSurface
  },
  badge: {
    backgroundColor: '#000000',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800'
  },
  meta: {
    fontSize: 14,
    color: kineticTheme.colors.onSurfaceVariant
  }
});
