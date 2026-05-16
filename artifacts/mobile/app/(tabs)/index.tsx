import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
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
const DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const CHART_HEIGHT = 140;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const {
    driverName,
    dailyGoal,
    todayNetProfit,
    todayEarnings,
    todayExpenses,
    todayRides,
    totalKmToday,
    hoursOnlineToday,
    weeklyData,
    addRide,
    addExpense,
  } = useApp();

  const goalProgress = dailyGoal > 0 ? Math.min((todayNetProfit / dailyGoal) * 100, 100) : 0;
  const maxWeekly = Math.max(...weeklyData, 1);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  function handleAddEarnings() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addRide({ value: 50, km: 10, durationMin: 15 });
  }

  function handleAddFuel() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addExpense({ label: "Abastecimento", amount: 50, category: "fuel" });
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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {driverName}</Text>
            <Text style={styles.appTitle}>
              CONTROLE <Text style={styles.appTitleAccent}>FINANCEIRO</Text>
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {driverName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.profitCard}>
          <View style={styles.profitGlow} />
          <Text style={styles.profitLabel}>Lucro Líquido Hoje</Text>
          <Text style={styles.profitAmount}>R$ {todayNetProfit}</Text>
          <View style={styles.profitFooter}>
            <View>
              <Text style={styles.profitGoalLabel}>Meta diária</Text>
              <Text style={styles.profitGoalValue}>R$ {dailyGoal}</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {Math.round(goalProgress)}%
              </Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${goalProgress}%` as any },
              ]}
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          {[
            {
              label: "Horas Online",
              value: `${hoursOnlineToday}h`,
              icon: "time-outline",
            },
            {
              label: "KM Rodados",
              value: totalKmToday.toFixed(1),
              icon: "speedometer-outline",
            },
            {
              label: "Combustível",
              value: `R$ ${todayExpenses}`,
              icon: "water-outline",
            },
            {
              label: "Corridas",
              value: `${todayRides.length}`,
              icon: "navigate-outline",
            },
          ].map(({ label, value, icon }) => (
            <View key={label} style={styles.statCard}>
              <Ionicons name={icon as any} size={18} color={MUTED} />
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ações Rápidas</Text>
            <Ionicons name="flash" size={22} color={YELLOW} />
          </View>
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionBtnPrimary,
                pressed && styles.pressed,
              ]}
              onPress={handleAddEarnings}
            >
              <Ionicons name="add-circle-outline" size={20} color="#000" />
              <Text style={styles.actionBtnPrimaryText}>+ Corrida R$50</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionBtnSecondary,
                pressed && styles.pressed,
              ]}
              onPress={handleAddFuel}
            >
              <Ionicons name="water-outline" size={20} color="#FFF" />
              <Text style={styles.actionBtnSecondaryText}>+ Combustível</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Ganhos da Semana</Text>
              <Text style={styles.cardSubtitle}>Últimos 7 dias</Text>
            </View>
            {todayEarnings > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>R$ {todayEarnings} hoje</Text>
              </View>
            )}
          </View>
          <View style={styles.chart}>
            {weeklyData.map((val, i) => {
              const barH = maxWeekly > 0 ? (val / maxWeekly) * CHART_HEIGHT : 4;
              const isToday = i === 6;
              return (
                <View key={i} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barH, 4),
                        backgroundColor: isToday
                          ? YELLOW
                          : val > 0
                          ? "rgba(250, 204, 21, 0.4)"
                          : BORDER,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
          <View style={styles.chartLabels}>
            {DAYS.map((d) => (
              <Text key={d} style={styles.chartLabel}>
                {d}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Resumo do Dia</Text>
            <Ionicons name="bulb-outline" size={22} color={YELLOW} />
          </View>
          {[
            {
              label: "Ganhos brutos",
              value: `R$ ${todayEarnings}`,
            },
            {
              label: "Total de gastos",
              value: `R$ ${todayExpenses}`,
            },
            {
              label: "Lucro líquido",
              value: `R$ ${todayNetProfit}`,
            },
          ].map(({ label, value }) => (
            <View key={label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{label}</Text>
              <Text style={styles.summaryValue}>{value}</Text>
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

  header: {
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.15)",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: { color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular" },
  appTitle: {
    color: "#FFF",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginTop: 4,
  },
  appTitleAccent: { color: YELLOW },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#000", fontSize: 24, fontFamily: "Inter_700Bold" },

  profitCard: {
    backgroundColor: YELLOW,
    borderRadius: 32,
    padding: 24,
    overflow: "hidden",
  },
  profitGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  profitLabel: {
    color: "rgba(0,0,0,0.6)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  profitAmount: {
    color: "#000",
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    marginTop: 6,
  },
  profitFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  profitGoalLabel: {
    color: "rgba(0,0,0,0.55)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  profitGoalValue: {
    color: "#000",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  progressBadge: {
    backgroundColor: "rgba(0,0,0,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  progressBadgeText: { color: "#000", fontSize: 20, fontFamily: "Inter_700Bold" },
  progressTrack: {
    height: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 6,
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: { height: 12, backgroundColor: "#000", borderRadius: 6 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "48%",
    backgroundColor: CARD,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    gap: 8,
  },
  statLabel: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  statValue: { color: YELLOW, fontSize: 26, fontFamily: "Inter_700Bold" },

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
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTitle: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  cardSubtitle: {
    color: MUTED,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },

  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 18,
    gap: 6,
  },
  actionBtnPrimary: { backgroundColor: YELLOW },
  actionBtnPrimaryText: { color: "#000", fontSize: 13, fontFamily: "Inter_700Bold" },
  actionBtnSecondary: { backgroundColor: BORDER },
  actionBtnSecondaryText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_700Bold" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },

  badge: {
    backgroundColor: YELLOW_DIM,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { color: YELLOW, fontSize: 12, fontFamily: "Inter_700Bold" },

  chart: {
    height: CHART_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  barWrapper: {
    flex: 1,
    height: CHART_HEIGHT,
    justifyContent: "flex-end",
  },
  bar: { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  chartLabels: { flexDirection: "row", justifyContent: "space-between" },
  chartLabel: {
    color: MUTED,
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    textAlign: "center",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryLabel: { color: MUTED, fontSize: 14, fontFamily: "Inter_400Regular" },
  summaryValue: { color: YELLOW, fontSize: 14, fontFamily: "Inter_700Bold" },
});
