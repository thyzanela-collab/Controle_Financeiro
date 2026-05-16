import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatCard } from '@/components/StatCard';
import { useRuns } from '@/context/RunsContext';
import { useColors } from '@/hooks/useColors';
import { formatDistance, formatDuration, formatPace, getMonthLabel } from '@/utils/format';

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function addMonths(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + delta);
  return d;
}

function getWeeksInMonth(year: number, month: number): { label: string; start: string; end: string }[] {
  const weeks: { label: string; start: string; end: string }[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let current = new Date(firstDay);
  let weekNum = 1;
  while (current <= lastDay) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (weekEnd > lastDay) weekEnd.setTime(lastDay.getTime());

    const toISO = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    weeks.push({
      label: `Wk ${weekNum}`,
      start: toISO(weekStart),
      end: toISO(weekEnd),
    });
    current.setDate(current.getDate() + 7);
    weekNum++;
  }
  return weeks;
}

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { runs } = useRuns();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthKey = getMonthKey(currentDate);
  const monthRuns = useMemo(
    () => runs.filter((r) => r.date.startsWith(monthKey)),
    [runs, monthKey],
  );

  const totalKm = useMemo(() => monthRuns.reduce((s, r) => s + r.distanceKm, 0), [monthRuns]);
  const totalMin = useMemo(() => monthRuns.reduce((s, r) => s + r.durationMin, 0), [monthRuns]);
  const avgPace = formatPace(totalMin, totalKm);
  const bestRun = useMemo(() => {
    if (!monthRuns.length) return null;
    return monthRuns.reduce((best, r) => (r.distanceKm > best.distanceKm ? r : best));
  }, [monthRuns]);

  const weeks = useMemo(
    () => getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate],
  );

  const weekBars = useMemo(() => {
    return weeks.map((w) => {
      const km = monthRuns
        .filter((r) => r.date >= w.start && r.date <= w.end)
        .reduce((s, r) => s + r.distanceKm, 0);
      return { ...w, km };
    });
  }, [weeks, monthRuns]);

  const maxKm = Math.max(...weekBars.map((b) => b.km), 1);

  const topPadding = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const isCurrentMonth = getMonthKey(new Date()) === monthKey;

  const easyRuns = monthRuns.filter((r) => r.runType === 'Easy').length;
  const tempoRuns = monthRuns.filter((r) => r.runType === 'Tempo').length;
  const longRuns = monthRuns.filter((r) => r.runType === 'Long').length;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 20, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Progress</Text>

      {/* Month Selector */}
      <View style={[styles.monthPicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable
          onPress={() => setCurrentDate((d) => addMonths(d, -1))}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 8 })}
        >
          <Feather name="chevron-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: colors.foreground }]}>
          {getMonthLabel(currentDate)}
        </Text>
        <Pressable
          onPress={() => setCurrentDate((d) => addMonths(d, 1))}
          disabled={isCurrentMonth}
          style={({ pressed }) => ({ opacity: isCurrentMonth ? 0.3 : pressed ? 0.5 : 1, padding: 8 })}
        >
          <Feather name="chevron-right" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <StatCard label="Total Distance" value={formatDistance(totalKm)} unit="km" accent />
        <StatCard label="Total Runs" value={String(monthRuns.length)} />
      </View>
      <View style={styles.grid}>
        <StatCard label="Total Time" value={formatDuration(totalMin)} />
        <StatCard label="Avg Pace" value={avgPace} />
      </View>
      <View style={styles.grid}>
        <StatCard
          label="Best Run"
          value={bestRun ? formatDistance(bestRun.distanceKm) : '--'}
          unit={bestRun ? 'km' : ''}
        />
        <StatCard
          label="Longest Time"
          value={bestRun ? formatDuration(bestRun.durationMin) : '--'}
        />
      </View>

      {/* Weekly Chart */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Weekly Breakdown</Text>
        <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>km per week</Text>

        {monthRuns.length === 0 ? (
          <View style={styles.chartEmpty}>
            <Text style={[styles.chartEmptyText, { color: colors.mutedForeground }]}>
              No runs this month
            </Text>
          </View>
        ) : (
          <View style={styles.chart}>
            {weekBars.map((bar) => {
              const heightPct = maxKm > 0 ? (bar.km / maxKm) * 100 : 0;
              return (
                <View key={bar.label} style={styles.chartCol}>
                  {bar.km > 0 && (
                    <Text style={[styles.barKm, { color: colors.primary }]}>
                      {bar.km.toFixed(1)}
                    </Text>
                  )}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(heightPct, bar.km > 0 ? 8 : 0)}%` as any,
                          backgroundColor: bar.km > 0 ? colors.primary : colors.muted,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>
                    {bar.label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Run Type Breakdown */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Run Types</Text>
        <View style={styles.typeBreakdown}>
          {[
            { label: 'Easy', count: easyRuns, color: '#22C55E' },
            { label: 'Tempo', count: tempoRuns, color: '#F59E0B' },
            { label: 'Long', count: longRuns, color: '#6366F1' },
          ].map((item) => (
            <View key={item.label} style={styles.typeRow}>
              <View style={[styles.typeDot, { backgroundColor: item.color }]} />
              <Text style={[styles.typeLabel, { color: colors.foreground }]}>{item.label}</Text>
              <View style={styles.typeBarTrack}>
                <View
                  style={[
                    styles.typeBarFill,
                    {
                      backgroundColor: item.color,
                      width:
                        monthRuns.length > 0
                          ? `${(item.count / monthRuns.length) * 100}%` as any
                          : '0%',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.typeCount, { color: colors.mutedForeground }]}>
                {item.count}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Motivational Footer */}
      {monthRuns.length === 0 && (
        <View style={[styles.motivationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="zap" size={24} color={colors.primary} />
          <Text style={[styles.motivationTitle, { color: colors.foreground }]}>
            Start your journey
          </Text>
          <Text style={[styles.motivationText, { color: colors.mutedForeground }]}>
            Every expert was once a beginner. Log your first run and watch your progress build.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  monthLabel: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  grid: { flexDirection: 'row', gap: 12 },
  card: { borderRadius: 24, borderWidth: 1, padding: 20, gap: 12 },
  cardTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  cardSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: -6 },
  chart: { height: 140, flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 4 },
  chartEmpty: { height: 80, alignItems: 'center', justifyContent: 'center' },
  chartEmptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  chartCol: { flex: 1, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' },
  barKm: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', borderRadius: 6, overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  typeBreakdown: { gap: 14 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', width: 50 },
  typeBarTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#2A2A2A', overflow: 'hidden' },
  typeBarFill: { height: 6, borderRadius: 3 },
  typeCount: { fontSize: 14, fontFamily: 'Inter_700Bold', width: 24, textAlign: 'right' },
  motivationCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  motivationTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  motivationText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
