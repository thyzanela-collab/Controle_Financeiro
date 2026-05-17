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

import { useApp, type Expense } from "@/context/AppContext";

const YELLOW = "#FACC15";
const YELLOW_DIM = "rgba(250,204,21,0.15)";
const CARD = "#18181B";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";
const RED = "#EF4444";
const RED_DIM = "rgba(239,68,68,0.12)";

const CATEGORIES: { key: Expense["category"]; label: string; icon: string }[] = [
  { key: "fuel",  label: "Combustível", icon: "water-outline" },
  { key: "food",  label: "Alimentação", icon: "fast-food-outline" },
  { key: "toll",  label: "Pedágio",     icon: "car-outline" },
  { key: "other", label: "Outros",      icon: "receipt-outline" },
];

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

export default function GastosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { expenses, addExpense, updateExpense, removeExpense, todayExpenses, todayExpenseList } = useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("fuel");

  const fuelTotal = todayExpenseList.filter((e) => e.category === "fuel").reduce((s, e) => s + e.amount, 0);

  function openAdd() {
    setLabel(""); setAmount(""); setCategory("fuel");
    setEditingId(null); setFormOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function openEdit(exp: Expense) {
    setLabel(exp.label); setAmount(String(exp.amount)); setCategory(exp.category);
    setEditingId(exp.id); setFormOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function closeForm() { setFormOpen(false); setEditingId(null); }

  function handleSave() {
    const a = parseFloat(amount);
    if (!a || a <= 0) {
      if (Platform.OS === "web") { window.alert("Informe um valor válido."); }
      else { Alert.alert("Valor inválido", "Informe o valor do gasto."); }
      return;
    }
    const finalLabel = label.trim() || CATEGORIES.find((c) => c.key === category)!.label;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (editingId) { updateExpense(editingId, { label: finalLabel, amount: a, category }); }
    else { addExpense({ label: finalLabel, amount: a, category }); }
    closeForm();
  }

  function handleRemove(id: string) {
    platformConfirm("Remover este gasto?", () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      removeExpense(id);
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
        <Text style={s.pageTitle}>Gastos</Text>

        {/* Summary */}
        <View style={s.summaryCard}>
          <View style={s.cardGlow} />
          <Text style={s.summaryLabel}>Total de Gastos Hoje</Text>
          <Text style={s.summaryAmount}>R$ {todayExpenses}</Text>
          {fuelTotal > 0 && (
            <View style={s.chip}>
              <Ionicons name="water-outline" size={13} color={YELLOW} />
              <Text style={s.chipText}>Combustível R$ {fuelTotal}</Text>
            </View>
          )}
        </View>

        {/* Form */}
        {formOpen ? (
          <View style={s.card}>
            <View style={s.formHead}>
              <Text style={s.cardTitle}>{editingId ? "Editar Gasto" : "Novo Gasto"}</Text>
              <Pressable onPress={closeForm} style={s.closeBtn}>
                <Ionicons name="close" size={20} color={MUTED} />
              </Pressable>
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Categoria</Text>
              <View style={s.catRow}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c.key}
                    style={[s.catBtn, category === c.key && s.catBtnActive]}
                    onPress={() => setCategory(c.key)}
                  >
                    <Ionicons name={c.icon as any} size={16} color={category === c.key ? "#000" : MUTED} />
                    <Text style={[s.catBtnText, category === c.key && s.catBtnTextActive]}>{c.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Descrição (opcional)</Text>
              <TextInput
                style={s.input}
                value={label}
                onChangeText={setLabel}
                placeholder="Ex: Posto Shell"
                placeholderTextColor={MUTED}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Valor (R$) *</Text>
              <TextInput
                style={s.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="Ex: 80.00"
                placeholderTextColor={MUTED}
                autoFocus={!editingId}
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
          <Pressable style={({ pressed }) => [s.addBtn, pressed && s.pressed]} onPress={openAdd}>
            <Ionicons name="add-circle-outline" size={22} color="#000" />
            <Text style={s.addBtnText}>Registrar novo gasto</Text>
          </Pressable>
        )}

        {/* List */}
        <View style={s.card}>
          <View style={s.listHead}>
            <Text style={s.cardTitle}>
              {expenses.length === 0 ? "Nenhum gasto registrado" : "Gastos Registrados"}
            </Text>
            {expenses.length > 0 && (
              <View style={s.badge}><Text style={s.badgeText}>{expenses.length}</Text></View>
            )}
          </View>

          {expenses.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="receipt-outline" size={44} color={BORDER} />
              <Text style={s.emptyTitle}>Nenhum gasto ainda</Text>
              <Text style={s.emptySub}>Toque em "Registrar novo gasto" para começar</Text>
            </View>
          ) : (
            expenses.map((exp, idx) => {
              const cat = CATEGORIES.find((c) => c.key === exp.category);
              const isEditing = editingId === exp.id;
              return (
                <View
                  key={exp.id}
                  style={[s.row, idx < expenses.length - 1 && s.rowBorder, isEditing && s.rowHighlight]}
                >
                  <View style={s.rowIcon}>
                    <Ionicons name={(cat?.icon ?? "receipt-outline") as any} size={18} color={RED} />
                  </View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>{exp.label}</Text>
                    <Text style={s.rowSub}>{exp.time} · {exp.date}</Text>
                  </View>
                  <Text style={s.rowAmount}>- R$ {exp.amount}</Text>
                  <View style={s.rowActions}>
                    <Pressable
                      style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
                      onPress={() => openEdit(exp)}
                      hitSlop={8}
                    >
                      <Ionicons name="create-outline" size={18} color={YELLOW} />
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
                      onPress={() => handleRemove(exp.id)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color={RED} />
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
    backgroundColor: "#1A0A0A", borderRadius: 32,
    borderWidth: 1, borderColor: RED_DIM,
    padding: 22, overflow: "hidden", gap: 10,
  },
  cardGlow: {
    position: "absolute", top: -30, right: -30,
    width: 140, height: 140, borderRadius: 70, backgroundColor: RED_DIM,
  },
  summaryLabel: { color: MUTED, fontSize: 13, fontFamily: "Inter_500Medium" },
  summaryAmount: { color: RED, fontSize: 46, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  chip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: YELLOW_DIM, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6, gap: 6, alignSelf: "flex-start",
  },
  chipText: { color: YELLOW, fontSize: 12, fontFamily: "Inter_600SemiBold" },

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
  catRow: { flexDirection: "row", gap: 8 },
  catBtn: {
    flex: 1, backgroundColor: BORDER, borderRadius: 12,
    paddingVertical: 10, alignItems: "center", gap: 4,
  },
  catBtnActive: { backgroundColor: YELLOW },
  catBtnText: { color: MUTED, fontSize: 10, fontFamily: "Inter_600SemiBold" },
  catBtnTextActive: { color: "#000" },

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
  rowIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: RED_DIM, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1, gap: 3 },
  rowLabel: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  rowSub: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular" },
  rowAmount: { color: RED, fontSize: 15, fontFamily: "Inter_700Bold" },
  rowActions: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 6 },

  empty: { alignItems: "center", paddingVertical: 36, gap: 10 },
  emptyTitle: { color: MUTED, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  emptySub: { color: BORDER, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
