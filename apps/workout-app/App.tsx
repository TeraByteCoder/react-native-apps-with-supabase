import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { WorkoutCard, WorkoutTrackingDashboard } from '@workout/shared-components';
import { loadWorkoutTrackingData, mockWorkoutTrackingData } from '@workout/shared-utils';

type WorkoutTrackingResultState = Awaited<ReturnType<typeof loadWorkoutTrackingData>>;

const upcomingWorkouts = [
  {
    id: 'w-001',
    title: 'Lower Body Strength',
    durationInMinutes: 45,
    difficulty: 'Intermediate'
  },
  {
    id: 'w-002',
    title: 'Core Stability Circuit',
    durationInMinutes: 20,
    difficulty: 'Beginner'
  }
] as const;

type HealthStatus = 'idle' | 'loading' | 'healthy' | 'unhealthy';

function getCurrentPathname(): string {
  const maybeWindow = globalThis as { window?: { location?: { pathname?: string } } };
  return maybeWindow.window?.location?.pathname ?? '/';
}

export default function App() {
  const [pathname, setPathnameState] = useState(getCurrentPathname());
  const [trackingResult, setTrackingResult] = useState<WorkoutTrackingResultState>({
    source: 'mock',
    data: mockWorkoutTrackingData,
    workouts: [],
    error: 'Workout tracking data has not loaded yet.'
  });
  const [trackingStatus, setTrackingStatus] = useState<'loading' | 'loaded'>('loading');

  const navigateTo = (pathname: string) => {
    setPathnameState(pathname);

    const maybeWindow = globalThis as {
      window?: {
        history?: { pushState: (data: unknown, title: string, url?: string | URL | null) => void };
        dispatchEvent?: (event: Event) => boolean;
      };
    };

    if (!maybeWindow.window?.history?.pushState || !maybeWindow.window.dispatchEvent) {
      return;
    }

    maybeWindow.window.history.pushState({}, '', pathname);
    maybeWindow.window.dispatchEvent(new Event('popstate'));
  };
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('idle');
  const [healthMessage, setHealthMessage] = useState('Noch kein Check ausgefuehrt.');

  const healthEndpoint = useMemo(() => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return null;
    }

    return `${supabaseUrl}/functions/v1/client-connection-check`;
  }, []);

  useEffect(() => {
    const maybeWindow = globalThis as {
      window?: {
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    };

    const syncPath = () => setPathnameState(getCurrentPathname());

    maybeWindow.window?.addEventListener?.('popstate', syncPath);

    return () => {
      maybeWindow.window?.removeEventListener?.('popstate', syncPath);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setTrackingStatus('loading');

      const result = await loadWorkoutTrackingData({
        env: {
          EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
          EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
        }
      });

      if (!isMounted) {
        return;
      }

      setTrackingResult(result);
      setTrackingStatus('loaded');
    }

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function runHealthCheck() {
    if (!healthEndpoint) {
      setHealthStatus('unhealthy');
      setHealthMessage('EXPO_PUBLIC_SUPABASE_URL fehlt. Bitte in der Workout-App konfigurieren.');
      return;
    }

    try {
      setHealthStatus('loading');
      setHealthMessage('Verbindung wird geprueft...');

      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string; error?: string };

      if (!response.ok || !payload.ok) {
        setHealthStatus('unhealthy');
        setHealthMessage(payload.error ?? 'Health-Check fehlgeschlagen.');
        return;
      }

      setHealthStatus('healthy');
      setHealthMessage(payload.message ?? 'Verbindung zur Edge Function ist gesund.');
    } catch {
      setHealthStatus('unhealthy');
      setHealthMessage('Verbindung konnte nicht hergestellt werden.');
    }
  }

  const isWelcomePage = pathname === '/';
  const isDashboardPage = pathname === '/dashboard';
  const isHealthPage = pathname === '/health';
  const isRegisterPage = pathname === '/register';
  const isRegistrationSuccessPage = pathname === '/register/success';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.navigationRow}>
          <Pressable onPress={() => navigateTo('/dashboard')} style={[styles.navButton, isDashboardPage && styles.navButtonActive]}>
            <Text style={[styles.navButtonText, isDashboardPage && styles.navButtonTextActive]}>Dashboard</Text>
          </Pressable>
          <Pressable
            onPress={() => navigateTo('/register')}
            style={[styles.navButton, (isRegisterPage || isRegistrationSuccessPage) && styles.navButtonActive]}
          >
            <Text style={[styles.navButtonText, (isRegisterPage || isRegistrationSuccessPage) && styles.navButtonTextActive]}>
              Register
            </Text>
          </Pressable>
          <Pressable onPress={() => navigateTo('/health')} style={[styles.navButton, isHealthPage && styles.navButtonActive]}>
            <Text style={[styles.navButtonText, isHealthPage && styles.navButtonTextActive]}>Health</Text>
          </Pressable>
        </View>

        {isDashboardPage ? (
          <>
            <Text style={styles.heading}>Workout App</Text>
            <Text style={styles.subheading}>Mobile-Frontend fuer Trainingsplaene, Sessions und Fortschritt.</Text>
            <View style={styles.trackingStatusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.label}>Tracking data source</Text>
                <Text
                  style={[
                    styles.statusPill,
                    trackingResult.source === 'supabase' ? styles.statusHealthy : styles.statusLoading
                  ]}
                >
                  {trackingStatus === 'loading' ? 'LOADING' : trackingResult.source.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.healthMessage}>
                {trackingResult.source === 'supabase'
                  ? 'Loaded workout tracking data from Supabase REST.'
                  : 'Using mock workout tracking data until Supabase URL and anon key are configured.'}
              </Text>
              {trackingResult.error ? <Text style={styles.errorText}>{trackingResult.error}</Text> : null}
            </View>
            <WorkoutTrackingDashboard {...trackingResult.data} />
            <Text style={styles.sectionHeading}>Upcoming workouts</Text>
            <View style={styles.list}>
              {upcomingWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  title={workout.title}
                  durationInMinutes={workout.durationInMinutes}
                  difficulty={workout.difficulty}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.healthCard}>
            <Text style={styles.heading}>Health Page</Text>
            <Text style={styles.subheading}>Prueft die Erreichbarkeit der Supabase Edge Function vom Workout-Client.</Text>
            <Text style={styles.label}>Endpoint</Text>
            <Text style={styles.endpointText}>{healthEndpoint ?? 'Nicht konfiguriert'}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Status</Text>
              <Text
                style={[
                  styles.statusPill,
                  healthStatus === 'healthy' && styles.statusHealthy,
                  healthStatus === 'unhealthy' && styles.statusUnhealthy,
                  healthStatus === 'loading' && styles.statusLoading
                ]}
              >
                {healthStatus.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.healthMessage}>{healthMessage}</Text>
            <Pressable onPress={runHealthCheck} style={styles.healthButton}>
              <Text style={styles.healthButtonText}>Health-Check ausfuehren</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4efe6'
  },
  content: {
    padding: 24,
    gap: 20
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 12
  },
  navButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff'
  },
  navButtonActive: {
    backgroundColor: '#111827',
    borderColor: '#111827'
  },
  navButtonText: {
    color: '#374151',
    fontWeight: '600'
  },
  navButtonTextActive: {
    color: '#ffffff'
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937'
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    maxWidth: 720
  },
  list: {
    gap: 16
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937'
  },
  trackingStatusCard: {
    maxWidth: 1120,
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  errorText: {
    fontSize: 14,
    color: '#991b1b',
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  healthCard: {
    maxWidth: 720,
    gap: 14,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6b7280',
    fontWeight: '700'
  },
  endpointText: {
    fontSize: 14,
    color: '#111827'
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: '#374151',
    backgroundColor: '#e5e7eb',
    fontWeight: '700'
  },
  statusHealthy: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  statusUnhealthy: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  statusLoading: {
    backgroundColor: '#fef3c7',
    color: '#92400e'
  },
  healthMessage: {
    fontSize: 14,
    color: '#1f2937'
  },
  healthButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start'
  },
  healthButtonText: {
    color: '#ecfeff',
    fontWeight: '700'
  }
});