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
const YELLOW_DIM = "rgba(250, 204, 21, 0.15)";
const CARD = "#18181B";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";
const RED = "#EF4444";
const RED_DIM = "rgba(239, 68, 68, 0.12)";

const CATEGORIES: { key: Expense["category"]; label: string; icon: string }[] = [
  { key: "fuel", label: "Combustível", icon: "water-outline" },
  { key: "maintenance", label: "Manutenção", icon: "construct-outline" },
  { key: "other", label: "Outros", icon: "receipt-outline" },
];

export default function GastosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { expenses, addExpense, removeExpense, todayExpenses, todayExpenseList } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("fuel");

  const fuelTotal = todayExpenseList
    .filter((e) => e.category === "fuel")
    .reduce((s, e) => s + e.amount, 0);

  function handleAdd() {
    const a = parseFloat(amount);
    if (!a || a <= 0) {
      Alert.alert("Valor inválido", "Informe o valor do gasto.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addExpense({
      label: label.trim() || CATEGORIES.find((c) => c.key === category)!.label,
      amount: a,
      category,
    });
    setLabel("");
    setAmount("");
    setCategory("fuel");
    setShowForm(false);
  }

  function handleRemove(id: string) {
    Alert.alert("Remover gasto", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          removeExpense(id);
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
        <Text style={styles.pageTitle}>Gastos</Text>

        <View style={styles.totalCard}>
          <View style={styles.glowBg} />
          <Text style={styles.totalLabel}>Total Hoje</Text>
          <Text style={styles.totalAmount}>R$ {todayExpenses}</Text>
          {fuelTotal > 0 && (
            <View style={styles.chip}>
              <Ionicons name="water-outline" size={14} color={YELLOW} />
              <Text style={styles.chipText}>Combustível R$ {fuelTotal}</Text>
            </View>
          )}
        </View>

        {showForm ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Novo Gasto</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoria</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c.key}
                    style={[
                      styles.categoryBtn,
                      category === c.key && styles.categoryBtnActive,
                    ]}
                    onPress={() => setCategory(c.key)}
                  >
                    <Ionicons
                      name={c.icon as any}
                      size={16}
                      color={category === c.key ? "#000" : MUTED}
                    />
                    <Text
                      style={[
                        styles.categoryBtnText,
                        category === c.key && styles.categoryBtnTextActive,
                      ]}
                    >
                      {c.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição (opcional)</Text>
              <TextInput
                style={styles.input}
                value={label}
                onChangeText={setLabel}
                placeholder="Ex: Posto Shell Av. Paulista"
                placeholderTextColor={MUTED}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor (R$) *</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="Ex: 80.00"
                placeholderTextColor={MUTED}
              />
            </View>

            <View style={styles.formActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.saveBtn,
                  pressed && styles.pressed,
                ]}
                onPress={handleAdd}
              >
                <Ionicons name="checkmark" size={18} color="#000" />
                <Text style={styles.saveBtnText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowForm(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={22} color="#000" />
            <Text style={styles.addBtnText}>Registrar novo gasto</Text>
          </Pressable>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Histórico</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{expenses.length}</Text>
            </View>
          </View>

          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color={BORDER} />
              <Text style={styles.emptyText}>Nenhum gasto registrado</Text>
              <Text style={styles.emptySubText}>
                Toque em "Registrar novo gasto" para começar
              </Text>
            </View>
          ) : (
            expenses.map((exp, idx) => {
              const cat = CATEGORIES.find((c) => c.key === exp.category);
              return (
                <Pressable
                  key={exp.id}
                  style={[
                    styles.expRow,
                    idx < expenses.length - 1 && styles.expBorder,
                  ]}
                  onLongPress={() => handleRemove(exp.id)}
                >
                  <View style={styles.expIcon}>
                    <Ionicons
                      name={(cat?.icon ?? "receipt-outline") as any}
                      size={18}
                      color={RED}
                    />
                  </View>
                  <View style={styles.expInfo}>
                    <Text style={styles.expLabel}>{exp.label}</Text>
                    <Text style={styles.expTime}>
                      {exp.time} · {exp.date}
                    </Text>
                  </View>
                  <Text style={styles.expAmount}>- R$ {exp.amount}</Text>
                </Pressable>
              );
            })
          )}
          {expenses.length > 0 && (
            <Text style={styles.hint}>Segure para remover um gasto</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14 },
  pageTitle: {
    color: "#FFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },

  totalCard: {
    backgroundColor: "#1A0A0A",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: RED_DIM,
    padding: 24,
    overflow: "hidden",
    gap: 10,
  },
  glowBg: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: RED_DIM,
  },
  totalLabel: { color: MUTED, fontSize: 13, fontFamily: "Inter_500Medium" },
  totalAmount: {
    color: RED,
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: YELLOW_DIM,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    alignSelf: "flex-start",
  },
  chipText: { color: YELLOW, fontSize: 12, fontFamily: "Inter_600SemiBold" },

  addBtn: {
    backgroundColor: YELLOW,
    borderRadius: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addBtnText: { color: "#000", fontSize: 15, fontFamily: "Inter_700Bold" },

  card: {
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  badge: {
    backgroundColor: YELLOW_DIM,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { color: YELLOW, fontSize: 13, fontFamily: "Inter_700Bold" },

  inputGroup: { gap: 6 },
  inputLabel: { color: MUTED, fontSize: 12, fontFamily: "Inter_500Medium" },
  input: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },

  categoryRow: { flexDirection: "row", gap: 8 },
  categoryBtn: {
    flex: 1,
    backgroundColor: BORDER,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
  },
  categoryBtnActive: { backgroundColor: YELLOW },
  categoryBtnText: {
    color: MUTED,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  categoryBtnTextActive: { color: "#000" },

  formActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  saveBtn: {
    flex: 2,
    backgroundColor: YELLOW,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveBtnText: { color: "#000", fontSize: 14, fontFamily: "Inter_700Bold" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },

  expRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  expBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  expIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: RED_DIM,
    alignItems: "center",
    justifyContent: "center",
  },
  expInfo: { flex: 1, gap: 3 },
  expLabel: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  expTime: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  expAmount: { color: RED, fontSize: 15, fontFamily: "Inter_700Bold" },

  emptyState: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { color: MUTED, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  emptySubText: {
    color: BORDER,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  hint: {
    color: BORDER,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
