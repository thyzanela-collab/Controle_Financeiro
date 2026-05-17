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
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

const YELLOW = "#FACC15";
const CARD = "#18181B";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";

function platformConfirm(title: string, msg: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${msg}`)) onConfirm();
  } else {
    Alert.alert(title, msg, [
      { text: "Cancelar", style: "cancel" },
      { text: "Apagar tudo", style: "destructive", onPress: onConfirm },
    ]);
  }
}

export default function ConfigScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { driverName, dailyGoal, setDailyGoal, setDriverName, clearAllData, earnings, expenses } = useApp();

  const [notifications, setNotifications] = useState(true);
  const [goalAlert, setGoalAlert] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(driverName);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(dailyGoal));
  const [confirmingClear, setConfirmingClear] = useState(false);

  function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDriverName(trimmed);
    setEditingName(false);
  }

  function handleSaveGoal() {
    const g = parseFloat(goalInput);
    if (!g || g <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDailyGoal(g);
    setEditingGoal(false);
  }

  function handleClearData() {
    platformConfirm(
      "Apagar todos os dados",
      `Isso vai remover ${earnings.length} ganhos e ${expenses.length} gastos. Esta ação não pode ser desfeita.`,
      () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        clearAllData();
        setConfirmingClear(false);
      }
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[s.content, { paddingTop: topPad + 16, paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.pageTitle}>Configurações</Text>

        {/* Profile */}
        <View style={s.profileCard}>
          <View style={s.avatarWrap}>
            <Text style={s.avatarText}>{driverName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{driverName}</Text>
            <Text style={s.profileSub}>{earnings.length} ganhos · {expenses.length} gastos</Text>
          </View>
          <Pressable
            style={({ pressed }) => [s.editIcon, pressed && s.pressed]}
            onPress={() => { setNameInput(driverName); setEditingName(true); }}
          >
            <Ionicons name="create-outline" size={20} color={YELLOW} />
          </Pressable>
        </View>

        {editingName && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Seu nome</Text>
            <TextInput
              style={s.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Digite seu nome"
              placeholderTextColor={MUTED}
              autoFocus
            />
            <View style={s.formActions}>
              <Pressable style={({ pressed }) => [s.cancelBtn, pressed && s.pressed]} onPress={() => setEditingName(false)}>
                <Text style={s.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [s.saveBtn, pressed && s.pressed]} onPress={handleSaveName}>
                <Ionicons name="checkmark" size={18} color="#000" />
                <Text style={s.saveBtnText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Meta */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>Meta Diária</Text>
          {editingGoal ? (
            <>
              <TextInput
                style={s.input}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="decimal-pad"
                placeholder="Ex: 600"
                placeholderTextColor={MUTED}
                autoFocus
              />
              <View style={s.formActions}>
                <Pressable style={({ pressed }) => [s.cancelBtn, pressed && s.pressed]} onPress={() => setEditingGoal(false)}>
                  <Text style={s.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [s.saveBtn, pressed && s.pressed]} onPress={handleSaveGoal}>
                  <Ionicons name="checkmark" size={18} color="#000" />
                  <Text style={s.saveBtnText}>Salvar</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={s.goalRow}>
              <View>
                <Text style={s.goalAmount}>R$ {dailyGoal}</Text>
                <Text style={s.goalSub}>Meta de lucro líquido diário</Text>
              </View>
              <Pressable
                style={({ pressed }) => [s.editBtn, pressed && s.pressed]}
                onPress={() => { setGoalInput(String(dailyGoal)); setEditingGoal(true); }}
              >
                <Ionicons name="create-outline" size={16} color="#000" />
                <Text style={s.editBtnText}>Editar</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Preferências */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>Preferências</Text>
          {[
            { label: "Notificações", sub: "Alertas e lembretes", icon: "notifications-outline", value: notifications, onChange: setNotifications },
            { label: "Alerta de meta", sub: "Avisar ao atingir 80% da meta", icon: "trophy-outline", value: goalAlert, onChange: setGoalAlert },
          ].map(({ label, sub, icon, value, onChange }, idx, arr) => (
            <View key={label} style={[s.prefRow, idx < arr.length - 1 && s.prefBorder]}>
              <View style={s.prefIcon}>
                <Ionicons name={icon as any} size={18} color={YELLOW} />
              </View>
              <View style={s.prefInfo}>
                <Text style={s.prefLabel}>{label}</Text>
                <Text style={s.prefSub}>{sub}</Text>
              </View>
              <Switch
                value={value}
                onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(v); }}
                trackColor={{ false: BORDER, true: YELLOW }}
                thumbColor={value ? "#000" : "#FFF"}
              />
            </View>
          ))}
        </View>

        {/* Dados */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>Dados</Text>
          <View style={s.dataRow}>
            <Ionicons name="cash-outline" size={18} color={MUTED} />
            <Text style={s.dataLabel}>{earnings.length} ganhos registrados</Text>
          </View>
          <View style={[s.dataRow, s.dataBorder]}>
            <Ionicons name="receipt-outline" size={18} color={MUTED} />
            <Text style={s.dataLabel}>{expenses.length} gastos registrados</Text>
          </View>

          <Pressable
            style={({ pressed }) => [s.dangerBtn, pressed && s.pressed]}
            onPress={handleClearData}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={s.dangerBtnText}>Apagar todos os dados</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14 },
  pageTitle: { color: "#FFF", fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },

  profileCard: {
    backgroundColor: CARD, borderRadius: 28, borderWidth: 1, borderColor: BORDER,
    padding: 20, flexDirection: "row", alignItems: "center", gap: 14,
  },
  avatarWrap: {
    width: 54, height: 54, borderRadius: 18,
    backgroundColor: YELLOW, alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#000", fontSize: 22, fontFamily: "Inter_700Bold" },
  profileName: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  profileSub: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  editIcon: { padding: 8 },

  card: { backgroundColor: CARD, borderRadius: 28, borderWidth: 1, borderColor: BORDER, padding: 20, gap: 12 },
  cardTitle: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionLabel: { color: MUTED, fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase" },

  input: {
    backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    color: "#FFF", fontSize: 16, fontFamily: "Inter_500Medium",
  },
  formActions: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: BORDER, paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { color: MUTED, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    flex: 2, backgroundColor: YELLOW, borderRadius: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  saveBtnText: { color: "#000", fontSize: 14, fontFamily: "Inter_700Bold" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },

  goalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  goalAmount: { color: "#FFF", fontSize: 28, fontFamily: "Inter_700Bold" },
  goalSub: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: YELLOW, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  editBtnText: { color: "#000", fontSize: 13, fontFamily: "Inter_700Bold" },

  prefRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  prefBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  prefIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(250,204,21,0.1)", alignItems: "center", justifyContent: "center" },
  prefInfo: { flex: 1, gap: 2 },
  prefLabel: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  prefSub: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },

  dataRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  dataBorder: { borderTopWidth: 1, borderTopColor: BORDER },
  dataLabel: { color: MUTED, fontSize: 14, fontFamily: "Inter_400Regular" },

  dangerBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", marginTop: 4,
  },
  dangerBtnText: { color: "#EF4444", fontSize: 14, fontFamily: "Inter_700Bold" },
});
