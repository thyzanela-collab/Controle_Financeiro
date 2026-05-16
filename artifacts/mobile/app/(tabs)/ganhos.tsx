import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp, type Ride } from "@/context/AppContext";

const YELLOW = "#FACC15";
const YELLOW_DIM = "rgba(250, 204, 21, 0.15)";
const CARD = "#18181B";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";

type FormMode = "add" | "edit";

export default function GanhosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { rides, addRide, updateRide, removeRide, todayEarnings, todayRides } = useApp();

  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [km, setKm] = useState("");
  const [duration, setDuration] = useState("");

  const totalKm = todayRides.reduce((s, r) => s + r.km, 0);
  const avgPerRide =
    todayRides.length > 0 ? Math.round(todayEarnings / todayRides.length) : 0;

  function openAdd() {
    setValue("");
    setKm("");
    setDuration("");
    setEditingId(null);
    setFormMode("add");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function openEdit(ride: Ride) {
    setValue(String(ride.value));
    setKm(ride.km > 0 ? String(ride.km) : "");
    setDuration(ride.durationMin > 0 ? String(ride.durationMin) : "");
    setEditingId(ride.id);
    setFormMode("edit");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function closeForm() {
    setFormMode(null);
    setEditingId(null);
  }

  function handleSave() {
    const v = parseFloat(value);
    if (!v || v <= 0) {
      Alert.alert("Valor inválido", "Informe o valor da corrida.");
      return;
    }
    const k = parseFloat(km) || 0;
    const d = parseInt(duration) || 0;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (formMode === "edit" && editingId) {
      updateRide(editingId, { value: v, km: k, durationMin: d });
    } else {
      addRide({ value: v, km: k, durationMin: d });
    }
    closeForm();
  }

  function handleRemove(id: string) {
    Alert.alert("Remover corrida", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          removeRide(id);
          if (editingId === id) closeForm();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Ganhos</Text>

        {/* Summary card */}
        <View style={styles.totalCard}>
          <View style={styles.profitGlow} />
          <Text style={styles.totalLabel}>Total Hoje</Text>
          <Text style={styles.totalAmount}>R$ {todayEarnings}</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalStat}>
              <Ionicons name="car-outline" size={14} color="rgba(0,0,0,0.5)" />
              <Text style={styles.totalStatText}>{todayRides.length} corridas</Text>
            </View>
            <View style={styles.totalStat}>
              <Ionicons name="navigate-outline" size={14} color="rgba(0,0,0,0.5)" />
              <Text style={styles.totalStatText}>{totalKm.toFixed(1)} km</Text>
            </View>
            {avgPerRide > 0 && (
              <View style={styles.totalStat}>
                <Ionicons name="trending-up-outline" size={14} color="rgba(0,0,0,0.5)" />
                <Text style={styles.totalStatText}>R$ {avgPerRide}/corrida</Text>
              </View>
            )}
          </View>
        </View>

        {/* Form */}
        {formMode ? (
          <View style={styles.card}>
            <View style={styles.formTitleRow}>
              <Text style={styles.cardTitle}>
                {formMode === "edit" ? "Editar Corrida" : "Nova Corrida"}
              </Text>
              <Pressable onPress={closeForm} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={MUTED} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor recebido (R$) *</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                placeholder="Ex: 35.50"
                placeholderTextColor={MUTED}
                autoFocus
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Distância (km)</Text>
                <TextInput
                  style={styles.input}
                  value={km}
                  onChangeText={setKm}
                  keyboardType="decimal-pad"
                  placeholder="Ex: 12.5"
                  placeholderTextColor={MUTED}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Duração (min)</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  placeholder="Ex: 20"
                  placeholderTextColor={MUTED}
                />
              </View>
            </View>

            <View style={styles.formActions}>
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                onPress={closeForm}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={18} color="#000" />
                <Text style={styles.saveBtnText}>
                  {formMode === "edit" ? "Salvar alteração" : "Salvar"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={openAdd}
          >
            <Ionicons name="add-circle-outline" size={22} color="#000" />
            <Text style={styles.addBtnText}>Registrar nova corrida</Text>
          </Pressable>
        )}

        {/* List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {rides.length > 0 ? "Corridas Registradas" : "Nenhuma corrida ainda"}
            </Text>
            {rides.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{rides.length}</Text>
              </View>
            )}
          </View>

          {rides.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={40} color={BORDER} />
              <Text style={styles.emptyText}>Nenhuma corrida registrada</Text>
              <Text style={styles.emptySubText}>
                Toque em "Registrar nova corrida" para começar
              </Text>
            </View>
          ) : (
            rides.map((ride, idx) => {
              const isEditing = editingId === ride.id;
              return (
                <View
                  key={ride.id}
                  style={[
                    styles.rideRow,
                    idx < rides.length - 1 && styles.rideBorder,
                    isEditing && styles.rideRowHighlight,
                  ]}
                >
                  <View style={styles.rideIcon}>
                    <Ionicons name="car-sport-outline" size={18} color={YELLOW} />
                  </View>
                  <View style={styles.rideInfo}>
                    <Text style={styles.rideTime}>
                      {ride.time} · {ride.date}
                    </Text>
                    <Text style={styles.rideMeta}>
                      {ride.km > 0 ? `${ride.km} km` : ""}
                      {ride.km > 0 && ride.durationMin > 0 ? " · " : ""}
                      {ride.durationMin > 0 ? `${ride.durationMin} min` : ""}
                    </Text>
                  </View>
                  <Text style={styles.rideValue}>R$ {ride.value}</Text>
                  <View style={styles.rideActions}>
                    <Pressable
                      style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                      onPress={() => openEdit(ride)}
                      hitSlop={8}
                    >
                      <Ionicons name="create-outline" size={18} color={YELLOW} />
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                      onPress={() => handleRemove(ride.id)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14 },
  pageTitle: { color: "#FFF", fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },

  totalCard: {
    backgroundColor: YELLOW,
    borderRadius: 32,
    padding: 24,
    overflow: "hidden",
    gap: 6,
  },
  profitGlow: {
    position: "absolute", top: -30, right: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  totalLabel: { color: "rgba(0,0,0,0.55)", fontSize: 13, fontFamily: "Inter_500Medium" },
  totalAmount: { color: "#000", fontSize: 48, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  totalRow: { flexDirection: "row", gap: 14, marginTop: 10, flexWrap: "wrap" },
  totalStat: { flexDirection: "row", alignItems: "center", gap: 5 },
  totalStatText: { color: "rgba(0,0,0,0.6)", fontSize: 13, fontFamily: "Inter_500Medium" },

  addBtn: {
    backgroundColor: YELLOW, borderRadius: 20, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  addBtnText: { color: "#000", fontSize: 15, fontFamily: "Inter_700Bold" },

  card: {
    backgroundColor: CARD, borderRadius: 28,
    borderWidth: 1, borderColor: BORDER, padding: 20, gap: 14,
  },
  formTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { padding: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  badge: { backgroundColor: YELLOW_DIM, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: YELLOW, fontSize: 13, fontFamily: "Inter_700Bold" },

  inputGroup: { gap: 6 },
  inputRow: { flexDirection: "row", gap: 10 },
  inputLabel: { color: MUTED, fontSize: 12, fontFamily: "Inter_500Medium" },
  input: {
    backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    color: "#FFF", fontSize: 16, fontFamily: "Inter_500Medium",
  },
  formActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1, borderRadius: 14, borderWidth: 1, borderColor: BORDER,
    paddingVertical: 14, alignItems: "center",
  },
  cancelBtnText: { color: MUTED, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    flex: 2, backgroundColor: YELLOW, borderRadius: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  saveBtnText: { color: "#000", fontSize: 14, fontFamily: "Inter_700Bold" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },

  rideRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 10 },
  rideBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  rideRowHighlight: { backgroundColor: "rgba(250,204,21,0.05)", borderRadius: 12 },
  rideIcon: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: YELLOW_DIM, alignItems: "center", justifyContent: "center",
  },
  rideInfo: { flex: 1, gap: 3 },
  rideTime: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  rideMeta: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular" },
  rideValue: { color: YELLOW, fontSize: 16, fontFamily: "Inter_700Bold" },
  rideActions: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 6 },

  emptyState: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { color: MUTED, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  emptySubText: { color: BORDER, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
