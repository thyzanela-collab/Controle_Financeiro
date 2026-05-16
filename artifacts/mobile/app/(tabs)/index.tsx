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
const CHART_HEIGHT = 130;

const STATUS_COLORS = {
  danger:  { bg: "#FACC15", label: "Começando", icon: "rocket-outline"   as const },
  warning: { bg: "#FB923C", label: "Bom ritmo",  icon: "trending-up-outline" as const },
  good:    { bg: "#34D399", label: "Quase lá!",  icon: "flame-outline"   as const },
  great:   { bg: "#22C55E", label: "Meta batida!", icon: "trophy-outline" as const },
};

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
    earningsPerHour,
    goalStatus,
    goalStreak,
    addRide,
    addExpense,
  } = useApp();

  const goalProgress = dailyGoal > 0
    ? Math.min((todayNetProfit / dailyGoal) * 100, 100)
    : 0;
  const maxWeekly = Math.max(...weeklyData, 1);
  const { bg: cardBg, label: statusLabel, icon: statusIcon } =
    STATUS_COLORS[goalStatus];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

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
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting}, {driverName}</Text>
            <Text style={styles.appTitle}>
              CONTROLE <Text style={styles.appTitleAccent}>FINANCEIRO</Text>
            </Text>
          </View>
          <View style={styles.headerRight}>
            {goalStreak > 0 && (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={14} color="#FF6B35" />
                <Text style={styles.streakText}>{goalStreak}</Text>
              </View>
            )}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {driverName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Profit card — color changes with goal progress */}
        <View style={[styles.profitCard, { backgroundColor: cardBg }]}>
          <View style={styles.profitGlow} />

          <View style={styles.statusRow}>
            <Ionicons name={statusIcon} size={16} color="rgba(0,0,0,0.55)" />
            <Text style={styles.statusLabel}>{statusLabel}</Text>
          </View>

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

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Horas Online"
            value={`${hoursOnlineToday}h`}
            icon="time-outline"
            sub={earningsPerHour > 0 ? `R$ ${earningsPerHour}/h` : undefined}
            highlight={earningsPerHour >= 60}
          />
          <StatCard
            label="KM Rodados"
            value={totalKmToday > 0 ? totalKmToday.toFixed(1) : "0"}
            icon="speedometer-outline"
          />
          <StatCard
            label="Combustível"
            value={`R$ ${todayExpenses}`}
            icon="water-outline"
            danger={todayExpenses > dailyGoal * 0.3}
          />
          <StatCard
            label="Corridas"
            value={`${todayRides.length}`}
            icon="navigate-outline"
            highlight={todayRides.length >= 10}
          />
        </View>

        {/* Quick actions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ações Rápidas</Text>
            <Ionicons name="flash" size={20} color={YELLOW} />
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
              <Ionicons name="add-circle-outline" size={18} color="#000" />
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
              <Ionicons name="water-outline" size={18} color="#FFF" />
              <Text style={styles.actionBtnSecondaryText}>+ Combustível</Text>
            </Pressable>
          </View>
        </View>

        {/* Weekly chart */}
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
              const barH = (val / maxWeekly) * CHART_HEIGHT;
              const isToday = i === 6;
              return (
                <View key={i} style={styles.barWrapper}>
                  {val > 0 && (
                    <Text style={styles.barVal}>
                      {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(val > 0 ? barH : 4, 4),
                        backgroundColor: isToday
                          ? cardBg
                          : val > 0
                          ? "rgba(250, 204, 21, 0.35)"
                          : BORDER,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.chartLabels}>
            {DAYS.map((d, i) => (
              <Text
                key={d}
                style={[
                  styles.chartLabel,
                  i === 6 && { color: YELLOW, fontFamily: "Inter_700Bold" },
                ]}
              >
                {d}
              </Text>
            ))}
          </View>
        </View>

        {/* Daily summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Resumo do Dia</Text>
            <Ionicons name="bulb-outline" size={20} color={YELLOW} />
          </View>

          <SummaryRow
            label="Ganhos brutos"
            value={`R$ ${todayEarnings}`}
            color="#22C55E"
          />
          <SummaryRow
            label="Total de gastos"
            value={`R$ ${todayExpenses}`}
            color="#EF4444"
          />
          <SummaryRow
            label="Lucro líquido"
            value={`R$ ${todayNetProfit}`}
            color={cardBg}
            bold
          />
          {earningsPerHour > 0 && (
            <SummaryRow
              label="Média por hora"
              value={`R$ ${earningsPerHour}/h`}
              color={YELLOW}
            />
          )}
          {goalStreak > 0 && (
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={16} color="#FF6B35" />
              <Text style={styles.streakRowText}>
                {goalStreak === 1
                  ? "Você bateu a meta hoje!"
                  : `${goalStreak} dias seguidos batendo a meta!`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  sub,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  icon: string;
  sub?: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  const valueColor = danger ? "#EF4444" : highlight ? "#22C55E" : YELLOW;
  return (
    <View style={[styles.statCard, danger && styles.statCardDanger]}>
      <Ionicons name={icon as any} size={16} color={MUTED} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

function SummaryRow({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          { color },
          bold && { fontSize: 16 },
        ]}
      >
        {value}
      </Text>
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
    gap: 12,
  },
  greeting: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  appTitle: {
    color: "#FFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    marginTop: 3,
  },
  appTitleAccent: { color: YELLOW },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,107,53,0.15)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 4,
  },
  streakText: {
    color: "#FF6B35",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#000", fontSize: 20, fontFamily: "Inter_700Bold" },

  profitCard: {
    borderRadius: 32,
    padding: 24,
    overflow: "hidden",
    gap: 4,
  },
  profitGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  statusLabel: {
    color: "rgba(0,0,0,0.55)",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  profitLabel: {
    color: "rgba(0,0,0,0.55)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  profitAmount: {
    color: "#000",
    fontSize: 50,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    marginTop: 2,
  },
  profitFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },
  profitGoalLabel: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  profitGoalValue: {
    color: "#000",
    fontSize: 16,
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
    height: 10,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 5,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: { height: 10, backgroundColor: "#000", borderRadius: 5 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "48%",
    backgroundColor: CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    gap: 6,
  },
  statCardDanger: { borderColor: "rgba(239,68,68,0.3)" },
  statLabel: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular" },
  statValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statSub: { color: "#22C55E", fontSize: 11, fontFamily: "Inter_600SemiBold" },

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
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTitle: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  cardSubtitle: {
    color: MUTED,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 16,
    gap: 6,
  },
  actionBtnPrimary: { backgroundColor: YELLOW },
  actionBtnPrimaryText: { color: "#000", fontSize: 13, fontFamily: "Inter_700Bold" },
  actionBtnSecondary: { backgroundColor: BORDER },
  actionBtnSecondaryText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_700Bold" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },

  badge: {
    backgroundColor: YELLOW_DIM,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: { color: YELLOW, fontSize: 11, fontFamily: "Inter_700Bold" },

  chart: {
    height: CHART_HEIGHT,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
  },
  barWrapper: {
    flex: 1,
    height: CHART_HEIGHT,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 3,
  },
  barVal: {
    color: MUTED,
    fontSize: 8,
    fontFamily: "Inter_500Medium",
  },
  bar: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  chartLabels: { flexDirection: "row" },
  chartLabel: {
    color: MUTED,
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    textAlign: "center",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryLabel: { color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 14, fontFamily: "Inter_700Bold" },

  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,107,53,0.1)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  streakRowText: {
    color: "#FF6B35",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
});
