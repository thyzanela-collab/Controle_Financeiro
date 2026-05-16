import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const YELLOW = "#FACC15";
const YELLOW_DIM = "rgba(250, 204, 21, 0.15)";
const CARD = "#18181B";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";
const RED = "#EF4444";
const RED_DIM = "rgba(239, 68, 68, 0.12)";

type Expense = {
  id: string;
  label: string;
  amount: number;
  icon: string;
  time: string;
  category: "fuel" | "maintenance" | "other";
};

const INITIAL: Expense[] = [
  { id: "1", label: "Abastecimento Shell", amount: 98, icon: "water-outline", time: "08:30", category: "fuel" },
  { id: "2", label: "Lavagem do carro", amount: 30, icon: "car-wash-outline" as any, time: "Ontem", category: "maintenance" },
  { id: "3", label: "Pedágio SP-280", amount: 8, icon: "map-outline", time: "09:15", category: "other" },
];

export default function GastosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [expenses, setExpenses] = useState<Expense[]>(INITIAL);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const fuelTotal = expenses.filter((e) => e.category === "fuel").reduce((s, e) => s + e.amount, 0);

  function handleAddFuel() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const id = Date.now().toString();
    setExpenses((prev) => [
      {
        id,
        label: "Abastecimento",
        amount: 50,
        icon: "water-outline",
        time: "Agora",
        category: "fuel",
      },
      ...prev,
    ]);
  }

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Gastos</Text>

        <View style={styles.totalCard}>
          <View style={styles.glowBg} />
          <Text style={styles.totalLabel}>Total Hoje</Text>
          <Text style={styles.totalAmount}>R$ {total}</Text>
          <View style={styles.totalRow}>
            <View style={styles.chip}>
              <Ionicons name="water-outline" size={14} color={YELLOW} />
              <Text style={styles.chipText}>Combustível R$ {fuelTotal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Adicionar Gasto</Text>
          <View style={styles.quickRow}>
            <Pressable
              style={({ pressed }) => [styles.quickBtn, pressed && styles.pressed]}
              onPress={handleAddFuel}
            >
              <Ionicons name="water-outline" size={20} color={YELLOW} />
              <Text style={styles.quickBtnText}>Combustível</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickBtn, pressed && styles.pressed]}
              onPress={() => {}}
            >
              <Ionicons name="construct-outline" size={20} color={YELLOW} />
              <Text style={styles.quickBtnText}>Manutenção</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickBtn, pressed && styles.pressed]}
              onPress={() => {}}
            >
              <Ionicons name="receipt-outline" size={20} color={YELLOW} />
              <Text style={styles.quickBtnText}>Outros</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Histórico</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{expenses.length}</Text>
            </View>
          </View>

          {expenses.map((exp, idx) => (
            <View
              key={exp.id}
              style={[styles.expRow, idx < expenses.length - 1 && styles.expBorder]}
            >
              <View style={styles.expIcon}>
                <Ionicons name={exp.icon as any} size={18} color={RED} />
              </View>
              <View style={styles.expInfo}>
                <Text style={styles.expLabel}>{exp.label}</Text>
                <Text style={styles.expTime}>{exp.time}</Text>
              </View>
              <Text style={styles.expAmount}>- R$ {exp.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
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
    gap: 6,
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
  totalAmount: { color: RED, fontSize: 48, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  totalRow: { flexDirection: "row", gap: 10, marginTop: 8, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: YELLOW_DIM,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  chipText: { color: YELLOW, fontSize: 12, fontFamily: "Inter_600SemiBold" },

  card: {
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    gap: 12,
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

  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1,
    backgroundColor: BORDER,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  },
  quickBtnText: { color: "#FFF", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },

  expRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
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
  expLabel: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  expTime: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  expAmount: { color: RED, fontSize: 15, fontFamily: "Inter_700Bold" },
});
