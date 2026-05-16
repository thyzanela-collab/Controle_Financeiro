import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}

export function StatCard({ label, value, unit, accent = false }: StatCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: accent ? colors.primary : colors.foreground }]}>
          {value}
        </Text>
        {unit ? (
          <Text style={[styles.unit, { color: colors.mutedForeground }]}>{unit}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  unit: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
