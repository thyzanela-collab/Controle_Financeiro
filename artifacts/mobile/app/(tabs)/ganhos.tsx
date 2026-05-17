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

import { useApp, type EarningEntry } from "@/context/AppContext";

const YELLOW = "#FACC15";
const YELLOW_DIM = "rgba(250,204,21,0.15)";
const CARD = "#18181B";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";

type EarningType = EarningEntry["type"];

const TYPES: { key: EarningType; label: string; icon: string; color: string; bg: string }[] = [
  { key: "uber99",     label: "Uber / 99",  icon: "car-sport-outline",  color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  { key: "particular", label: "Particular", icon: "person-outline",     color: "#34D399", bg: "rgba(52,211,153,0.15)" },
  { key: "gorjeta",    label: "Gorjeta",    icon: "gift-outline",        color: YELLOW,    bg: YELLOW_DIM },
];

function typeInfo(key: EarningType) {
  return TYPES.find((t) => t.key === key) ?? TYPES[0];
}

function platformConfirm(msg: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(msg)) onConfirm();
  } else {
    Alert.alert("Confirmar", msg, [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: onConfirm },
    ]);
  }
}

export default function GanhosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { earnings, todayEarnings, todayEarningList, addEarning, updateEarning, removeEarning } = useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selType, setSelType] = useState<EarningType>("uber99");
  const [amount, setAmount] = useState("");

  const todayUber  = todayEarningList.filter((e) => e.type === "uber99").reduce((s, e) => s + e.amount, 0);
  const todayPart  = todayEarningList.filter((e) => e.type === "particular").reduce((s, e) => s + e.amount, 0);
  const todayGorj  = todayEarningList.filter((e) => e.type === "gorjeta").reduce((s, e) => s + e.amount, 0);

  function openAdd() {
    setEditingId(null);
    setSelType("uber99");
    setAmount("");
    setFormOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function openEdit(entry: EarningEntry) {
    setEditingId(entry.id);
    setSelType(entry.type);
    setAmount(String(entry.amount));
    setFormOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  function handleSave() {
    const v = parseFloat(amount);
    if (!v || v <= 0) {
      if (Platform.OS === "web") {
        window.alert("Informe um valor válido.");
      } else {
        Alert.alert("Valor inválido", "Informe o valor do ganho.");
      }
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (editingId) {
      updateEarning(editingId, { type: selType, amount: v });
    } else {
      addEarning({ type: selType, amount: v });
    }
    closeForm();
  }

  function handleRemove(id: string) {
    platformConfirm("Remover este ganho?", () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      removeEarning(id);
      if (editingId === id) closeForm();
    });
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
        <Text style={s.pageTitle}>Ganhos</Text>

        {/* Summary */}
        <View style={s.summaryCard}>
          <View style={s.cardGlow} />
          <Text style={s.summaryLabel}>Total de Ganhos Hoje</Text>
          <Text style={s.summaryAmount}>R$ {todayEarnings}</Text>
          <View style={s.typeBadges}>
            {TYPES.map((t) => {
              const val = t.key === "uber99" ? todayUber : t.key === "particular" ? todayPart : todayGorj;
              return (
                <View key={t.key} style={[s.typeBadge, { backgroundColor: t.bg, borderColor: `${t.color}30` }]}>
                  <Ionicons name={t.icon as any} size={13} color={t.color} />
                  <Text style={[s.typeBadgeLabel, { color: t.color }]}>{t.label}</Text>
                  <Text style={[s.typeBadgeVal, { color: t.color }]}>R$ {val}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Form */}
        {formOpen ? (
          <View style={s.card}>
            <View style={s.formHead}>
              <Text style={s.cardTitle}>{editingId ? "Editar Ganho" : "Novo Ganho"}</Text>
              <Pressable onPress={closeForm} style={s.closeBtn}>
                <Ionicons name="close" size={20} color={MUTED} />
              </Pressable>
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Modalidade</Text>
              <View style={s.typeRow}>
                {TYPES.map((t) => (
                  <Pressable
                    key={t.key}
                    style={[s.typeBtn, selType === t.key && { backgroundColor: t.color, borderColor: t.color }]}
                    onPress={() => setSelType(t.key)}
                  >
                    <Ionicons name={t.icon as any} size={16} color={selType === t.key ? "#000" : MUTED} />
                    <Text style={[s.typeBtnLabel, selType === t.key && { color: "#000" }]}>
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Valor (R$) *</Text>
              <TextInput
                style={s.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="Ex: 150.00"
                placeholderTextColor={MUTED}
                autoFocus
              />
            </View>

            <View style={s.formActions}>
              <Pressable style={({ pressed }) => [s.cancelBtn, pressed && s.pressed]} onPress={closeForm}>
                <Text style={s.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [s.saveBtn, pressed && s.pressed]} onPress={handleSave}>
                <Ionicons name="checkmark" size={18} color="#000" />
                <Text style={s.saveBtnText}>{editingId ? "Salvar alteração" : "Salvar"}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [s.addBtn, pressed && s.pressed]}
            onPress={openAdd}
          >
            <Ionicons name="add-circle-outline" size={22} color="#000" />
            <Text style={s.addBtnText}>Registrar ganho</Text>
          </Pressable>
        )}

        {/* List */}
        <View style={s.card}>
          <View style={s.listHead}>
            <Text style={s.cardTitle}>
              {earnings.length === 0 ? "Nenhum ganho registrado" : "Ganhos Registrados"}
            </Text>
            {earnings.length > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{earnings.length}</Text>
              </View>
            )}
          </View>

          {earnings.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="cash-outline" size={44} color={BORDER} />
              <Text style={s.emptyTitle}>Nenhum ganho ainda</Text>
              <Text style={s.emptySub}>Toque em "Registrar ganho" para começar</Text>
            </View>
          ) : (
            earnings.map((entry, idx) => {
              const t = typeInfo(entry.type);
              const isEditing = editingId === entry.id;
              return (
                <View
                  key={entry.id}
                  style={[
                    s.row,
                    idx < earnings.length - 1 && s.rowBorder,
                    isEditing && s.rowHighlight,
                  ]}
                >
                  <View style={[s.rowIcon, { backgroundColor: t.bg }]}>
                    <Ionicons name={t.icon as any} size={18} color={t.color} />
                  </View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>{t.label}</Text>
                    <Text style={s.rowSub}>{entry.time} · {entry.date}</Text>
                  </View>
                  <Text style={[s.rowAmount, { color: t.color }]}>R$ {entry.amount}</Text>
                  <View style={s.rowActions}>
                    <Pressable
                      style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
                      onPress={() => openEdit(entry)}
                      hitSlop={8}
                    >
                      <Ionicons name="create-outline" size={18} color={YELLOW} />
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
                      onPress={() => handleRemove(entry.id)}
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

const s = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14 },
  pageTitle: { color: "#FFF", fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },

  summaryCard: {
    backgroundColor: YELLOW, borderRadius: 32, padding: 22,
    overflow: "hidden", gap: 6,
  },
  cardGlow: {
    position: "absolute", top: -30, right: -30,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  summaryLabel: { color: "rgba(0,0,0,0.55)", fontSize: 13, fontFamily: "Inter_500Medium" },
  summaryAmount: { color: "#000", fontSize: 46, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  typeBadges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  typeBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  typeBadgeLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  typeBadgeVal: { fontSize: 12, fontFamily: "Inter_700Bold" },

  addBtn: {
    backgroundColor: YELLOW, borderRadius: 20, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  addBtnText: { color: "#000", fontSize: 15, fontFamily: "Inter_700Bold" },

  card: {
    backgroundColor: CARD, borderRadius: 28,
    borderWidth: 1, borderColor: BORDER, padding: 20, gap: 14,
  },
  formHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { padding: 4 },
  cardTitle: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  listHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { backgroundColor: YELLOW_DIM, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: YELLOW, fontSize: 13, fontFamily: "Inter_700Bold" },

  inputGroup: { gap: 6 },
  inputLabel: { color: MUTED, fontSize: 12, fontFamily: "Inter_500Medium" },
  input: {
    backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 13,
    color: "#FFF", fontSize: 17, fontFamily: "Inter_500Medium",
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeBtn: {
    flex: 1, backgroundColor: BORDER, borderRadius: 12,
    borderWidth: 1, borderColor: "transparent",
    paddingVertical: 10, alignItems: "center", gap: 4,
  },
  typeBtnLabel: { color: MUTED, fontSize: 10, fontFamily: "Inter_600SemiBold", textAlign: "center" },
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

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  rowHighlight: { backgroundColor: "rgba(250,204,21,0.05)", borderRadius: 12 },
  rowIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1, gap: 3 },
  rowLabel: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowSub: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular" },
  rowAmount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  rowActions: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 6 },

  empty: { alignItems: "center", paddingVertical: 36, gap: 10 },
  emptyTitle: { color: MUTED, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  emptySub: { color: BORDER, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
