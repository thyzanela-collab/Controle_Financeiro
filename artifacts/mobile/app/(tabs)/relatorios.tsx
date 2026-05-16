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

import { useApp } from "@/context/AppContext";

const YELLOW = "#FACC15";
const YELLOW_DIM = "rgba(250, 204, 21, 0.15)";
const CARD = "#18181B";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";
const RED = "#EF4444";
const GREEN = "#22C55E";

function getLast7DayLabels(): string[] {
  const labels = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const result: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(labels[d.getDay()]);
  }
  return result;
}

export default function RelatoriosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const {
    rides,
    expenses,
    dailyGoal,
    todayEarnings,
    todayExpenses,
    todayNetProfit,
    todayRides,
    weeklyData,
  } = useApp();

  const totalEarnings = rides.reduce((s, r) => s + r.value, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalProfit = totalEarnings - totalExpenses;
  const totalKm = rides.reduce((s, r) => s + r.km, 0);
  const avgPerRide =
    rides.length > 0 ? Math.round(totalEarnings / rides.length) : 0;

  const weeklyTotal = weeklyData.reduce((s, v) => s + v, 0);
  const weeklyMax = Math.max(...weeklyData, 1);
  const dayLabels = getLast7DayLabels();

  const fuelExpenses = expenses
    .filter((e) => e.category === "fuel")
    .reduce((s, e) => s + e.amount, 0);
  const maintenanceExpenses = expenses
    .filter((e) => e.category === "maintenance")
    .reduce((s, e) => s + e.amount, 0);

  const goalProgress = dailyGoal > 0
    ? Math.min((todayNetProfit / dailyGoal) * 100, 100)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Relatórios</Text>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroLabel}>Lucro Total Acumulado</Text>
          <Text style={styles.heroAmount}>
            R$ {totalProfit.toFixed(2).replace(".", ",")}
          </Text>
          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <Ionicons name="car-outline" size={14} color="rgba(0,0,0,0.5)" />
              <Text style={styles.heroStatText}>{rides.length} corridas</Text>
            </View>
            <View style={styles.heroStat}>
              <Ionicons name="navigate-outline" size={14} color="rgba(0,0,0,0.5)" />
              <Text style={styles.heroStatText}>{totalKm.toFixed(1)} km</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hoje</Text>
          <View style={styles.todayGoalRow}>
            <Text style={styles.todayGoalLabel}>Meta diária</Text>
            <Text style={styles.todayGoalPct}>{Math.round(goalProgress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${goalProgress}%` as any },
              ]}
            />
          </View>
          <View style={styles.summaryGrid}>
            {[
              { label: "Ganhos", value: `R$ ${todayEarnings}`, color: YELLOW },
              { label: "Gastos", value: `R$ ${todayExpenses}`, color: RED },
              { label: "Lucro", value: `R$ ${todayNetProfit}`, color: GREEN },
              { label: "Corridas", value: `${todayRides.length}`, color: "#FFF" },
            ].map(({ label, value, color }) => (
              <View key={label} style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>{label}</Text>
                <Text style={[styles.summaryCardValue, { color }]}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Últimos 7 Dias</Text>
          <Text style={[styles.heroAmount2]}>
            R$ {weeklyTotal.toFixed(2).replace(".", ",")}
          </Text>
          <View style={styles.weekChart}>
            {weeklyData.map((val, i) => {
              const h = (val / weeklyMax) * 100;
              const isToday = i === 6;
              return (
                <View key={i} style={styles.weekBarWrap}>
                  <Text style={styles.weekVal}>
                    {val > 0 ? `${val}` : ""}
                  </Text>
                  <View style={styles.weekBarBg}>
                    <View
                      style={[
                        styles.weekBar,
                        {
                          height: `${Math.max(h, 4)}%` as any,
                          backgroundColor: isToday ? YELLOW : val > 0 ? "rgba(250,204,21,0.4)" : BORDER,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.weekDay, isToday && { color: YELLOW }]}>
                    {dayLabels[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Breakdown de Gastos</Text>
            <Ionicons name="pie-chart-outline" size={20} color={MUTED} />
          </View>
          {[
            { label: "Combustível", value: fuelExpenses, icon: "water-outline", color: YELLOW },
            { label: "Manutenção", value: maintenanceExpenses, icon: "construct-outline", color: "#F97316" },
            { label: "Outros", value: totalExpenses - fuelExpenses - maintenanceExpenses, icon: "receipt-outline", color: MUTED },
          ].map(({ label, value, icon, color }) => (
            <View key={label} style={styles.breakdownRow}>
              <View style={[styles.breakdownIcon, { backgroundColor: `${color}18` }]}>
                <Ionicons name={icon as any} size={16} color={color} />
              </View>
              <Text style={styles.breakdownLabel}>{label}</Text>
              <View style={styles.breakdownBarWrap}>
                <View
                  style={[
                    styles.breakdownBar,
                    {
                      width: totalExpenses > 0
                        ? `${(value / totalExpenses) * 100}%` as any
                        : "0%",
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.breakdownValue, { color }]}>
                R$ {value.toFixed(0)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Médias</Text>
            <Ionicons name="analytics-outline" size={20} color={YELLOW} />
          </View>
          {[
            { label: "Ganho por corrida", value: `R$ ${avgPerRide}` },
            { label: "KM por corrida", value: rides.length > 0 ? `${(totalKm / rides.length).toFixed(1)} km` : "—" },
            { label: "Gasto total", value: `R$ ${totalExpenses.toFixed(0)}` },
          ].map(({ label, value }) => (
            <View key={label} style={styles.avgRow}>
              <Text style={styles.avgLabel}>{label}</Text>
              <Text style={styles.avgValue}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
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
  heroAmount: { color: "#000", fontSize: 40, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  heroAmount2: { color: YELLOW, fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  heroRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  heroStat: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroStatText: { color: "rgba(0,0,0,0.6)", fontSize: 13, fontFamily: "Inter_500Medium" },

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

  todayGoalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayGoalLabel: { color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular" },
  todayGoalPct: { color: YELLOW, fontSize: 13, fontFamily: "Inter_700Bold" },
  progressTrack: {
    height: 8,
    backgroundColor: BORDER,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: YELLOW, borderRadius: 4 },

  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryCard: {
    width: "48%",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  summaryCardLabel: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryCardValue: { fontSize: 20, fontFamily: "Inter_700Bold" },

  weekChart: {
    height: 120,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  weekBarWrap: {
    flex: 1,
    height: 120,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  weekVal: { color: MUTED, fontSize: 8, fontFamily: "Inter_500Medium" },
  weekBarBg: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  weekBar: {
    width: "100%",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  weekDay: { color: MUTED, fontSize: 9, fontFamily: "Inter_600SemiBold" },

  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  breakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  breakdownLabel: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    width: 90,
  },
  breakdownBarWrap: {
    flex: 1,
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    overflow: "hidden",
  },
  breakdownBar: { height: 6, borderRadius: 3 },
  breakdownValue: { fontSize: 13, fontFamily: "Inter_700Bold", width: 55, textAlign: "right" },

  avgRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avgLabel: { color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular" },
  avgValue: { color: YELLOW, fontSize: 14, fontFamily: "Inter_700Bold" },
});
