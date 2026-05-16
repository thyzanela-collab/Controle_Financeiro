import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WeeklyChart } from '@/components/WeeklyChart';
import { RunCard } from '@/components/RunCard';
import { StatCard } from '@/components/StatCard';
import { useRuns } from '@/context/RunsContext';
import { useColors } from '@/hooks/useColors';
import { formatDistance, formatDuration, getMonthLabel } from '@/utils/format';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { runs } = useRuns();

  const now = new Date();
  const monthLabel = getMonthLabel(now);

  const monthRuns = useMemo(() => {
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return runs.filter((r) => r.date.startsWith(ym));
  }, [runs, now]);

  const totalKm = useMemo(() => monthRuns.reduce((s, r) => s + r.distanceKm, 0), [monthRuns]);
  const totalMin = useMemo(() => monthRuns.reduce((s, r) => s + r.durationMin, 0), [monthRuns]);
  const goalKm = 50;
  const progressPct = Math.min((totalKm / goalKm) * 100, 100);

  const bestRun = useMemo(() => {
    if (!monthRuns.length) return null;
    return monthRuns.reduce((best, r) => (r.distanceKm > best.distanceKm ? r : best));
  }, [monthRuns]);

  const recentRuns = runs.slice(0, 3);

  const topPadding = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 20, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome back</Text>
          <Text style={[styles.appName, { color: colors.foreground }]}>
            RUN<Text style={{ color: colors.primary }}>START</Text>
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/log')}
          style={[styles.logBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={22} color="#000" />
        </Pressable>
      </View>

      {/* Month Hero Card */}
      <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.heroLabel}>{monthLabel}</Text>
        <Text style={styles.heroKm}>{totalKm.toFixed(1)}</Text>
        <Text style={styles.heroUnit}>km this month</Text>

        <View style={styles.heroFooter}>
          <View>
            <Text style={styles.heroGoalLabel}>Monthly goal</Text>
            <Text style={styles.heroGoalValue}>{goalKm} km</Text>
          </View>
          <View style={[styles.pctBadge]}>
            <Text style={styles.pctText}>{Math.round(progressPct)}%</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard label="Runs" value={String(monthRuns.length)} accent />
        <StatCard
          label="Time"
          value={formatDuration(totalMin)}
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="Best Run"
          value={bestRun ? formatDistance(bestRun.distanceKm) : '--'}
          unit={bestRun ? 'km' : ''}
        />
        <StatCard
          label="Avg Run"
          value={monthRuns.length ? formatDistance(totalKm / monthRuns.length) : '--'}
          unit={monthRuns.length ? 'km' : ''}
        />
      </View>

      {/* Weekly Chart */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Last 7 Days</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Daily km</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {runs.filter((r) => {
                const d = new Date(r.date + 'T00:00:00');
                const ago = new Date();
                ago.setDate(ago.getDate() - 7);
                return d >= ago;
              }).length}{' '}
              runs
            </Text>
          </View>
        </View>
        <WeeklyChart runs={runs} />
      </View>

      {/* Recent Runs */}
      <View style={styles.recentHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Runs</Text>
        {runs.length > 3 && (
          <Pressable onPress={() => router.push('/(tabs)/history')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </Pressable>
        )}
      </View>

      {recentRuns.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="activity" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No runs yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Tap + to log your first run
          </Text>
        </View>
      ) : (
        <View style={styles.runList}>
          {recentRuns.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  appName: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  logBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    gap: 4,
  },
  heroLabel: { fontSize: 13, color: '#00000088', fontFamily: 'Inter_500Medium' },
  heroKm: { fontSize: 56, color: '#000', fontFamily: 'Inter_700Bold', lineHeight: 64 },
  heroUnit: { fontSize: 14, color: '#00000088', fontFamily: 'Inter_400Regular' },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  heroGoalLabel: { fontSize: 12, color: '#00000066', fontFamily: 'Inter_400Regular' },
  heroGoalValue: { fontSize: 16, color: '#000', fontFamily: 'Inter_700Bold' },
  pctBadge: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pctText: { fontSize: 20, color: '#000', fontFamily: 'Inter_700Bold' },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#000',
    borderRadius: 4,
  },
  statsGrid: { flexDirection: 'row', gap: 12 },
  section: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  sectionSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  seeAll: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  emptyBox: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginTop: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  runList: { gap: 10 },
});
