import { Feather } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RunCard } from '@/components/RunCard';
import { useRuns } from '@/context/RunsContext';
import { useColors } from '@/hooks/useColors';
import { Run } from '@/types/run';

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { runs, deleteRun } = useRuns();

  const topPadding = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Run', 'Remove this run from your log?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRun(id),
        },
      ]);
    },
    [deleteRun],
  );

  const renderItem = useCallback(
    ({ item }: { item: Run }) => (
      <RunCard run={item} onDelete={handleDelete} />
    ),
    [handleDelete],
  );

  const keyExtractor = useCallback((item: Run) => item.id, []);

  return (
    <FlatList
      data={runs}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding + 20, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Run History</Text>
          <View style={[styles.countBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>{runs.length}</Text>
            <Text style={[styles.countLabel, { color: colors.mutedForeground }]}>total</Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="wind" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No runs logged</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Head to the Log tab to record your first run
          </Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  countText: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  countLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  empty: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginTop: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
});
