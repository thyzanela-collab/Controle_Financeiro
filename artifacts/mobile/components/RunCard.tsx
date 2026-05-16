import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { Run, RunType } from '@/types/run';
import { formatDateDisplay, formatDistance, formatDuration, formatPace } from '@/utils/format';

const RUN_TYPE_COLOR: Record<RunType, string> = {
  Easy: '#22C55E',
  Tempo: '#F59E0B',
  Long: '#6366F1',
};

interface RunCardProps {
  run: Run;
  onDelete?: (id: string) => void;
}

export function RunCard({ run, onDelete }: RunCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: RUN_TYPE_COLOR[run.runType] + '22' },
            ]}
          >
            <Text style={[styles.typeText, { color: RUN_TYPE_COLOR[run.runType] }]}>
              {run.runType}
            </Text>
          </View>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {formatDateDisplay(run.date)}
          </Text>
        </View>
        {onDelete && (
          <Pressable
            onPress={() => onDelete(run.id)}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Feather name="trash-2" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {formatDistance(run.distanceKm)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>km</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {formatDuration(run.durationMin)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>time</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {formatPace(run.durationMin, run.distanceKm)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>pace</Text>
        </View>
      </View>

      {run.notes ? (
        <Text style={[styles.notes, { color: colors.mutedForeground }]} numberOfLines={2}>
          {run.notes}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  date: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
  },
  notes: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
});
