import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
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

const MONTHLY = [
  { month: "Jan", earnings: 3200, fuel: 520, profit: 2680 },
  { month: "Fev", earnings: 2900, fuel: 480, profit: 2420 },
  { month: "Mar", earnings: 3800, fuel: 610, profit: 3190 },
  { month: "Abr", earnings: 4100, fuel: 650, profit: 3450 },
  { month: "Mai", earnings: 3600, fuel: 590, profit: 3010 },
];

export default function RelatoriosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const lastMonth = MONTHLY[MONTHLY.length - 1];
  const prevMonth = MONTHLY[MONTHLY.length - 2];
  const profitChange = (
    ((lastMonth.profit - prevMonth.profit) / prevMonth.profit) * 100
  ).toFixed(1);

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
        <Text style={styles.pageTitle}>Relatórios</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroLabel}>Lucro — Maio</Text>
          <Text style={styles.heroAmount}>R$ {lastMonth.profit.toLocaleString("pt-BR")}</Text>
          <View style={styles.heroChip}>
            <Ionicons
              name={Number(profitChange) >= 0 ? "trending-up" : "trending-down"}
              size={14}
              color="#000"
            />
            <Text style={styles.heroChipText}>
              {Number(profitChange) >= 0 ? "+" : ""}{profitChange}% vs Abr
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Resumo Mensal</Text>
            <Ionicons name="calendar-outline" size={20} color={MUTED} />
          </View>

          <View style={styles.summaryGrid}>
            {[
              { label: "Ganhos Brutos", value: `R$ ${lastMonth.earnings.toLocaleString("pt-BR")}`, icon: "cash-outline", color: YELLOW },
              { label: "Combustível", value: `R$ ${lastMonth.fuel}`, icon: "water-outline", color: "#EF4444" },
              { label: "Lucro Líquido", value: `R$ ${lastMonth.profit.toLocaleString("pt-BR")}`, icon: "wallet-outline", color: "#22C55E" },
              { label: "Taxa/Plataforma", value: "R$ 340", icon: "phone-portrait-outline", color: MUTED },
            ].map(({ label, value, icon, color }) => (
              <View key={label} style={styles.summaryCard}>
                <Ionicons name={icon as any} size={20} color={color} />
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={[styles.summaryValue, { color }]}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Histórico Mensal</Text>
          {[...MONTHLY].reverse().map((m, idx) => (
            <View
              key={m.month}
              style={[styles.historyRow, idx < MONTHLY.length - 1 && styles.historyBorder]}
            >
              <View style={styles.historyMonth}>
                <Text style={styles.historyMonthText}>{m.month}</Text>
              </View>
              <View style={styles.historyBar}>
                <View
                  style={[
                    styles.historyFill,
                    { width: `${(m.profit / 4000) * 100}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.historyProfit}>R$ {m.profit.toLocaleString("pt-BR")}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Insights</Text>
            <Ionicons name="bulb-outline" size={20} color={YELLOW} />
          </View>
          {[
            "Sexta-feira é seu dia mais lucrativo com R$ 98/dia em média.",
            "Seu horário de pico é entre 18h e 22h. Priorize esses turnos.",
            "Maio foi seu melhor mês no último trimestre.",
          ].map((tip, i) => (
            <View key={i} style={styles.insightRow}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>{tip}</Text>
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

  heroCard: {
    backgroundColor: YELLOW,
    borderRadius: 32,
    padding: 24,
    overflow: "hidden",
    gap: 8,
  },
  heroGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  heroLabel: { color: "rgba(0,0,0,0.55)", fontSize: 13, fontFamily: "Inter_500Medium" },
  heroAmount: { color: "#000", fontSize: 44, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    alignSelf: "flex-start",
  },
  heroChipText: { color: "#000", fontSize: 13, fontFamily: "Inter_700Bold" },

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

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  summaryLabel: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 17, fontFamily: "Inter_700Bold" },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  historyBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  historyMonth: {
    width: 36,
    alignItems: "center",
  },
  historyMonthText: { color: MUTED, fontSize: 12, fontFamily: "Inter_600SemiBold" },
  historyBar: {
    flex: 1,
    height: 8,
    backgroundColor: BORDER,
    borderRadius: 4,
    overflow: "hidden",
  },
  historyFill: {
    height: 8,
    backgroundColor: YELLOW,
    borderRadius: 4,
  },
  historyProfit: { color: "#FFF", fontSize: 13, fontFamily: "Inter_700Bold", width: 80, textAlign: "right" },

  insightRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: YELLOW,
    marginTop: 6,
  },
  insightText: { flex: 1, color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
