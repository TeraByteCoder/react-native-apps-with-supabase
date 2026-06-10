import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { WorkoutCard, WorkoutTrackingDashboard } from '@workout/shared-components';
import { loadWorkoutTrackingData, mockWorkoutTrackingData } from '@workout/shared-utils';

type WorkoutTrackingResultState = Awaited<ReturnType<typeof loadWorkoutTrackingData>>;
type HealthStatus = 'idle' | 'loading' | 'healthy' | 'unhealthy';
type Route = '/' | '/login' | '/register' | '/dashboard' | '/health';

const colors = {
  black: '#000000',
  surface: '#05080d',
  surfaceHigh: '#0b111a',
  surfaceBright: '#101923',
  border: '#1f2a37',
  text: '#ffffff',
  muted: '#94a3b8',
  primary: '#7dd3fc',
  primaryStrong: '#38bdf8',
  onPrimary: '#00111c',
  danger: '#fda4af',
  success: '#86efac'
};

const workoutActions = [
  'Start workout',
  'Mark next set done',
  'Pause / Resume',
  'Reset session'
] as const;

const upcomingWorkouts = [
  { id: 'w-001', title: 'Lower Body Strength', durationInMinutes: 45, difficulty: 'Intermediate' },
  { id: 'w-002', title: 'Core Stability Circuit', durationInMinutes: 20, difficulty: 'Beginner' },
  { id: 'w-003', title: 'Mobility Reset', durationInMinutes: 12, difficulty: 'Beginner' }
] as const;

function getCurrentPathname(): Route {
  const maybeWindow = globalThis as { window?: { location?: { pathname?: string } } };
  const pathname = maybeWindow.window?.location?.pathname ?? '/';

  if (pathname === '/login' || pathname === '/register' || pathname === '/dashboard' || pathname === '/health') {
    return pathname;
  }

  return '/';
}

export default function App() {
  const [pathname, setPathnameState] = useState<Route>(getCurrentPathname());
  const [trackingResult, setTrackingResult] = useState<WorkoutTrackingResultState>({
    source: 'mock',
    data: mockWorkoutTrackingData,
    workouts: [],
    error: 'Workout tracking data has not loaded yet.'
  });
  const [trackingStatus, setTrackingStatus] = useState<'loading' | 'loaded'>('loading');
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('idle');
  const [healthMessage, setHealthMessage] = useState('Noch kein Check ausgefuehrt.');
  const [email, setEmail] = useState('max@example.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Max');
  const [authMessage, setAuthMessage] = useState('Demo-Modus: Supabase Auth wird vorbereitet.');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [localCompletedSets, setLocalCompletedSets] = useState(mockWorkoutTrackingData.completedSets);

  const healthEndpoint = useMemo(() => {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    return supabaseUrl ? `${supabaseUrl}/functions/v1/client-connection-check` : null;
  }, []);

  const navigateTo = (nextPathname: Route) => {
    setPathnameState(nextPathname);

    const maybeWindow = globalThis as {
      window?: {
        history?: { pushState: (data: unknown, title: string, url?: string | URL | null) => void };
        dispatchEvent?: (event: Event) => boolean;
      };
    };

    if (!maybeWindow.window?.history?.pushState || !maybeWindow.window.dispatchEvent) {
      return;
    }

    maybeWindow.window.history.pushState({}, '', nextPathname);
    maybeWindow.window.dispatchEvent(new Event('popstate'));
  };

  useEffect(() => {
    const maybeWindow = globalThis as {
      window?: {
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    };

    const syncPath = () => setPathnameState(getCurrentPathname());
    maybeWindow.window?.addEventListener?.('popstate', syncPath);

    return () => maybeWindow.window?.removeEventListener?.('popstate', syncPath);
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
      setLocalCompletedSets(result.data.completedSets);
      setTrackingStatus('loaded');
    }

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const interactiveTrackingData = {
    ...trackingResult.data,
    completedSets: localCompletedSets,
    syncState: trackingResult.source === 'supabase' ? trackingResult.data.syncState : sessionStarted ? 'syncing' as const : trackingResult.data.syncState,
    events: [
      {
        id: 'local-session-state',
        label: sessionStarted
          ? sessionPaused
            ? 'User paused the local workout session'
            : 'User started the local workout session'
          : 'User can start the session from the app dashboard',
        timestamp: 'Local UI action',
        status: sessionStarted ? 'pending' as const : 'warning' as const
      },
      ...trackingResult.data.events
    ]
  };

  function handleLogin() {
    if (!email.includes('@') || password.length < 4) {
      setAuthMessage('Bitte E-Mail und mindestens 4 Zeichen Passwort eingeben.');
      return;
    }

    setAuthMessage(`Login fuer ${email} vorbereitet. Sobald Supabase Auth aktiv ist, wird hier signInWithPassword verwendet.`);
    navigateTo('/dashboard');
  }

  function handleRegister() {
    if (name.trim().length < 2 || !email.includes('@') || password.length < 4) {
      setAuthMessage('Bitte Name, gueltige E-Mail und Passwort ausfuellen.');
      return;
    }

    setAuthMessage(`Account fuer ${name.trim()} vorbereitet. Supabase Auth Registration wird nach Projekt-Unpause verbunden.`);
    navigateTo('/dashboard');
  }

  function handleWorkoutAction(action: typeof workoutActions[number]) {
    if (action === 'Start workout') {
      setSessionStarted(true);
      setSessionPaused(false);
      return;
    }

    if (action === 'Mark next set done') {
      setSessionStarted(true);
      setSessionPaused(false);
      setLocalCompletedSets((current) => Math.min(current + 1, trackingResult.data.totalSets));
      return;
    }

    if (action === 'Pause / Resume') {
      setSessionStarted(true);
      setSessionPaused((current) => !current);
      return;
    }

    setSessionStarted(false);
    setSessionPaused(false);
    setLocalCompletedSets(trackingResult.data.completedSets);
  }

  async function runHealthCheck() {
    if (!healthEndpoint) {
      setHealthStatus('unhealthy');
      setHealthMessage('EXPO_PUBLIC_SUPABASE_URL fehlt. Bitte in der Workout-App konfigurieren.');
      return;
    }

    try {
      setHealthStatus('loading');
      setHealthMessage('Verbindung wird geprueft...');

      const response = await fetch(healthEndpoint, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
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

  const renderNav = () => (
    <View style={styles.navigationRow}>
      {([
        ['/', 'Start'],
        ['/login', 'Login'],
        ['/register', 'Register'],
        ['/dashboard', 'Dashboard'],
        ['/health', 'Health']
      ] as const).map(([route, label]) => (
        <Pressable key={route} onPress={() => navigateTo(route)} style={[styles.navButton, pathname === route && styles.navButtonActive]}>
          <Text style={[styles.navButtonText, pathname === route && styles.navButtonTextActive]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {renderNav()}

        {pathname === '/' ? (
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>Minimal Supabase Workout App</Text>
            <Text style={styles.heroTitle}>Train smart. Track light.</Text>
            <Text style={styles.heroLead}>
              Fertiger Dark-Mode-Prototyp fuer Workout Tracking, Supabase Auth, Live-Daten-Fallback und CDD/Storybook.
            </Text>
            <View style={styles.actionRow}>
              <Pressable onPress={() => navigateTo('/register')} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Account erstellen</Text>
              </Pressable>
              <Pressable onPress={() => navigateTo('/dashboard')} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Demo ansehen</Text>
              </Pressable>
            </View>
            <View style={styles.metricGrid}>
              <Metric value="4" label="Pflichtscreens" />
              <Metric value="Auth" label="Supabase-ready" />
              <Metric value="CDD" label="Storybook" />
            </View>
          </View>
        ) : null}

        {pathname === '/login' ? (
          <AuthCard
            title="Willkommen zurueck"
            subtitle="Minimaler Login-Screen fuer Supabase Auth Password Grant."
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleLogin}
            submitLabel="Einloggen"
            message={authMessage}
          />
        ) : null}

        {pathname === '/register' ? (
          <AuthCard
            title="Account erstellen"
            subtitle="Registrierung fuer Athletes, Coach-Zugriff und spaetere Supabase Profile."
            email={email}
            password={password}
            name={name}
            onNameChange={setName}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleRegister}
            submitLabel="Registrieren"
            message={authMessage}
          />
        ) : null}

        {pathname === '/dashboard' ? (
          <>
            <View style={styles.screenHeader}>
              <View>
                <Text style={styles.eyebrow}>Overview</Text>
                <Text style={styles.heading}>Dein heutiger Plan</Text>
                <Text style={styles.subheading}>Live-Daten kommen aus Supabase; bis das Projekt aktiv ist nutzt die App Demo-Daten.</Text>
              </View>
              <Text style={[styles.statusPill, trackingResult.source === 'supabase' ? styles.statusHealthy : styles.statusMock]}>
                {trackingStatus === 'loading' ? 'LOADING' : trackingResult.source.toUpperCase()}
              </Text>
            </View>

            <View style={styles.actionPanel}>
              {workoutActions.map((action) => (
                <Pressable key={action} onPress={() => handleWorkoutAction(action)} style={action === 'Start workout' ? styles.primaryButton : styles.secondaryButton}>
                  <Text style={action === 'Start workout' ? styles.primaryButtonText : styles.secondaryButtonText}>{action}</Text>
                </Pressable>
              ))}
            </View>

            {trackingResult.error ? <Text style={styles.errorText}>{trackingResult.error}</Text> : null}
            <WorkoutTrackingDashboard {...interactiveTrackingData} />

            <Text style={styles.sectionHeading}>Weitere Workouts</Text>
            <View style={styles.list}>
              {upcomingWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} title={workout.title} durationInMinutes={workout.durationInMinutes} difficulty={workout.difficulty} />
              ))}
            </View>
          </>
        ) : null}

        {pathname === '/health' ? (
          <View style={styles.formCard}>
            <Text style={styles.eyebrow}>Health</Text>
            <Text style={styles.heading}>Supabase Verbindung</Text>
            <Text style={styles.subheading}>Prueft die Erreichbarkeit der Edge Function vom Workout-Client.</Text>
            <Text style={styles.label}>Endpoint</Text>
            <Text style={styles.codeText}>{healthEndpoint ?? 'Nicht konfiguriert'}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.statusPill, healthStatus === 'healthy' && styles.statusHealthy, healthStatus === 'unhealthy' && styles.statusUnhealthy]}>
                {healthStatus.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.helperText}>{healthMessage}</Text>
            <Pressable onPress={runHealthCheck} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Health-Check ausfuehren</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function AuthCard({
  title,
  subtitle,
  email,
  password,
  name,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  submitLabel,
  message
}: {
  title: string;
  subtitle: string;
  email: string;
  password: string;
  name?: string;
  onNameChange?: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  message: string;
}) {
  return (
    <View style={styles.formCard}>
      <Text style={styles.eyebrow}>{submitLabel}</Text>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.subheading}>{subtitle}</Text>
      {onNameChange ? (
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={onNameChange} placeholder="Max" placeholderTextColor={colors.muted} style={styles.input} />
        </View>
      ) : null}
      <View style={styles.field}>
        <Text style={styles.label}>E-Mail</Text>
        <TextInput value={email} onChangeText={onEmailChange} autoCapitalize="none" keyboardType="email-address" placeholder="max@example.com" placeholderTextColor={colors.muted} style={styles.input} />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Passwort</Text>
        <TextInput value={password} onChangeText={onPasswordChange} secureTextEntry placeholder="Passwort" placeholderTextColor={colors.muted} style={styles.input} />
      </View>
      <Pressable onPress={onSubmit} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>{submitLabel}</Text>
      </Pressable>
      <Text style={styles.helperText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  content: { padding: 24, gap: 22, backgroundColor: colors.black, minHeight: '100%' },
  navigationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  navButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface },
  navButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  navButtonText: { color: colors.text, fontWeight: '800' },
  navButtonTextActive: { color: colors.onPrimary },
  heroCard: { maxWidth: 1120, gap: 18, borderRadius: 32, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 28 },
  eyebrow: { color: colors.primary, fontSize: 12, letterSpacing: 1.1, textTransform: 'uppercase', fontWeight: '900' },
  heroTitle: { color: colors.text, fontSize: 64, lineHeight: 68, fontWeight: '900', letterSpacing: -2.5, maxWidth: 850 },
  heroLead: { color: colors.muted, fontSize: 18, lineHeight: 28, maxWidth: 760 },
  heading: { color: colors.text, fontSize: 34, lineHeight: 40, fontWeight: '900' },
  subheading: { color: colors.muted, fontSize: 16, lineHeight: 24, maxWidth: 760 },
  screenHeader: { maxWidth: 1120, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionPanel: { maxWidth: 1120, flexDirection: 'row', flexWrap: 'wrap', gap: 12, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 14, backgroundColor: colors.surface },
  primaryButton: { backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 1, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 13, alignSelf: 'flex-start' },
  primaryButtonText: { color: colors.onPrimary, fontWeight: '900' },
  secondaryButton: { backgroundColor: colors.surfaceHigh, borderColor: colors.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 13, alignSelf: 'flex-start' },
  secondaryButtonText: { color: colors.text, fontWeight: '800' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { minWidth: 160, flex: 1, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceHigh, padding: 18 },
  metricValue: { color: colors.primary, fontSize: 28, fontWeight: '900' },
  metricLabel: { color: colors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '900' },
  formCard: { maxWidth: 680, gap: 15, borderRadius: 28, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 26 },
  field: { gap: 8 },
  label: { color: colors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '900' },
  input: { color: colors.text, backgroundColor: colors.black, borderColor: colors.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, outlineStyle: 'none' as never },
  helperText: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  codeText: { color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.black, borderRadius: 14, padding: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  statusPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, fontSize: 12, fontWeight: '900', color: colors.text, backgroundColor: colors.surfaceBright, overflow: 'hidden' },
  statusMock: { backgroundColor: colors.surfaceBright, color: colors.primary },
  statusHealthy: { backgroundColor: colors.success, color: '#001a0a' },
  statusUnhealthy: { backgroundColor: colors.danger, color: '#210008' },
  errorText: { maxWidth: 1120, color: colors.danger, backgroundColor: '#1d0508', borderColor: '#4c1118', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  sectionHeading: { color: colors.text, fontSize: 22, fontWeight: '900' },
  list: { maxWidth: 1120, gap: 14 }
});
