import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRuns } from '@/context/RunsContext';
import { useColors } from '@/hooks/useColors';
import { RunType } from '@/types/run';
import { addDays, formatDateDisplay, getTodayISO } from '@/utils/format';

const RUN_TYPES: RunType[] = ['Easy', 'Tempo', 'Long'];

const RUN_TYPE_DESC: Record<RunType, string> = {
  Easy: 'Comfortable, conversational pace',
  Tempo: 'Comfortably hard, sustained effort',
  Long: 'Slow & steady, build endurance',
};

export default function LogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addRun } = useRuns();

  const [date, setDate] = useState(getTodayISO());
  const [distanceStr, setDistanceStr] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [runType, setRunType] = useState<RunType>('Easy');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  function changeDay(delta: number) {
    setDate((prev) => addDays(prev, delta));
  }

  async function handleSave() {
    const km = parseFloat(distanceStr);
    const mins = parseInt(minutes || '0', 10);
    const secs = parseInt(seconds || '0', 10);

    if (!distanceStr || isNaN(km) || km <= 0) {
      Alert.alert('Distance required', 'Please enter a valid distance.');
      return;
    }
    if (mins === 0 && secs === 0) {
      Alert.alert('Duration required', 'Please enter how long your run took.');
      return;
    }

    const totalMin = mins + secs / 60;

    setSaving(true);
    try {
      await addRun({ date, distanceKm: km, durationMin: totalMin, runType, notes: notes.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDistanceStr('');
      setMinutes('');
      setSeconds('');
      setNotes('');
      setDate(getTodayISO());
      router.push('/(tabs)/index');
    } finally {
      setSaving(false);
    }
  }

  const topPadding = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const canSave = !!distanceStr && parseFloat(distanceStr) > 0;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 20, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Log Your Run</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Every run counts — keep going
      </Text>

      {/* Date Picker */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Date</Text>
        <View style={styles.dateRow}>
          <Pressable
            onPress={() => changeDay(-1)}
            style={({ pressed }) => [styles.arrowBtn, { opacity: pressed ? 0.5 : 1 }]}
          >
            <Feather name="chevron-left" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.dateText, { color: colors.foreground }]}>
            {formatDateDisplay(date)}
          </Text>
          <Pressable
            onPress={() => changeDay(1)}
            style={({ pressed }) => [styles.arrowBtn, { opacity: pressed ? 0.5 : 1 }]}
            disabled={date >= getTodayISO()}
          >
            <Feather
              name="chevron-right"
              size={20}
              color={date >= getTodayISO() ? colors.mutedForeground : colors.foreground}
            />
          </Pressable>
        </View>
      </View>

      {/* Distance */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Distance</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.bigInput, { color: colors.foreground }]}
            value={distanceStr}
            onChangeText={setDistanceStr}
            placeholder="0.0"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="decimal-pad"
            maxLength={6}
          />
          <Text style={[styles.inputUnit, { color: colors.mutedForeground }]}>km</Text>
        </View>
      </View>

      {/* Duration */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Duration</Text>
        <View style={styles.durationRow}>
          <View style={styles.durationField}>
            <TextInput
              style={[styles.bigInput, { color: colors.foreground }]}
              value={minutes}
              onChangeText={(v) => setMinutes(v.replace(/[^0-9]/g, ''))}
              placeholder="00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={[styles.inputUnit, { color: colors.mutedForeground }]}>min</Text>
          </View>
          <Text style={[styles.colon, { color: colors.mutedForeground }]}>:</Text>
          <View style={styles.durationField}>
            <TextInput
              style={[styles.bigInput, { color: colors.foreground }]}
              value={seconds}
              onChangeText={(v) => {
                const n = parseInt(v.replace(/[^0-9]/g, '') || '0', 10);
                setSeconds(Math.min(n, 59).toString());
              }}
              placeholder="00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={[styles.inputUnit, { color: colors.mutedForeground }]}>sec</Text>
          </View>
        </View>
      </View>

      {/* Run Type */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Run Type</Text>
        <View style={styles.typeRow}>
          {RUN_TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setRunType(t)}
              style={({ pressed }) => [
                styles.typeBtn,
                {
                  backgroundColor:
                    runType === t ? colors.primary : colors.secondary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: runType === t ? '#000' : colors.foreground },
                ]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.typeDesc, { color: colors.mutedForeground }]}>
          {RUN_TYPE_DESC[runType]}
        </Text>
      </View>

      {/* Notes */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Notes (optional)</Text>
        <TextInput
          style={[styles.notesInput, { color: colors.foreground }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it feel?"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
          maxLength={300}
        />
      </View>

      {/* Save */}
      <Pressable
        onPress={handleSave}
        disabled={!canSave || saving}
        style={({ pressed }) => [
          styles.saveBtn,
          {
            backgroundColor: canSave ? colors.primary : colors.muted,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        {saving ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={[styles.saveBtnText, { color: canSave ? '#000' : colors.mutedForeground }]}>
            Save Run
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: -6, marginBottom: 4 },
  card: { borderRadius: 24, borderWidth: 1, padding: 20, gap: 12 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrowBtn: { padding: 8 },
  dateText: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  inputRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  bigInput: { fontSize: 40, fontFamily: 'Inter_700Bold', minWidth: 80 },
  inputUnit: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  durationField: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  colon: { fontSize: 32, fontFamily: 'Inter_700Bold' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  typeBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  typeDesc: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  notesInput: { fontSize: 15, fontFamily: 'Inter_400Regular', minHeight: 70, textAlignVertical: 'top' },
  saveBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
});
