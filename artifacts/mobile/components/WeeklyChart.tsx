import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { Run } from '@/types/run';
import { addDays, getTodayISO } from '@/utils/format';

interface WeeklyChartProps {
  runs: Run[];
}

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function WeeklyChart({ runs }: WeeklyChartProps) {
  const colors = useColors();

  const bars = useMemo(() => {
    const today = getTodayISO();
    const days: { label: string; date: string; km: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const dow = new Date(date + 'T00:00:00').getDay();
      const km = runs
        .filter((r) => r.date === date)
        .reduce((sum, r) => sum + r.distanceKm, 0);
      days.push({ label: DAY_LABELS[dow], date, km });
    }
    return days;
  }, [runs]);

  const maxKm = Math.max(...bars.map((b) => b.km), 1);
  const todayDate = getTodayISO();

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {bars.map((bar) => {
          const isToday = bar.date === todayDate;
          const heightPct = maxKm > 0 ? (bar.km / maxKm) * 100 : 0;
          return (
            <View key={bar.date} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${Math.max(heightPct, bar.km > 0 ? 8 : 0)}%` as any,
                      backgroundColor: bar.km > 0 ? colors.primary : colors.muted,
                      opacity: isToday && bar.km === 0 ? 0.4 : 1,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isToday ? colors.primary : colors.mutedForeground,
                    fontFamily: isToday ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  },
                ]}
              >
                {bar.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 10,
  },
});
