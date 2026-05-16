import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
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

const WEEKLY = [40, 65, 55, 85, 70, 100, 90];
const DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const CHART_HEIGHT = 140;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [earnings, setEarnings] = useState<number>(482);
  const [fuel] = useState<number>(98);
  const [rides, setRides] = useState<number>(23);

  const netProfit = useMemo(() => earnings - fuel, [earnings, fuel]);
  const goalProgress = Math.min((netProfit / 600) * 100, 100);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleAddEarnings() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEarnings((prev) => prev + 50);
  }

  function handleAddRide() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRides((prev) => prev + 1);
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
          <View>
            <Text style={styles.greeting}>Boa noite, Thyago</Text>
            <Text style={styles.appTitle}>
              VELOZ <Text style={styles.appTitleAccent}>DRIVER</Text>
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>V</Text>
          </View>
        </View>

        {/* Profit Card */}
        <View style={styles.profitCard}>
          <View style={styles.profitGlow} />
          <Text style={styles.profitLabel}>Lucro Líquido Hoje</Text>
          <Text style={styles.profitAmount}>R$ {netProfit}</Text>
          <View style={styles.profitFooter}>
            <View>
              <Text style={styles.profitGoalLabel}>Meta diária</Text>
              <Text style={styles.profitGoalValue}>R$ 600</Text>
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

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: "Horas Online", value: "8.4h", icon: "time-outline" },
            { label: "KM Rodados", value: "164", icon: "speedometer-outline" },
            { label: "Combustível", value: `R$ ${fuel}`, icon: "water-outline" },
            { label: "Corridas", value: `${rides}`, icon: "navigate-outline" },
          ].map(({ label, value, icon }) => (
            <View key={label} style={styles.statCard}>
              <Ionicons name={icon as any} size={18} color={MUTED} />
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
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
              <Text style={styles.actionBtnPrimaryText}>+ R$50</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionBtnSecondary,
                pressed && styles.pressed,
              ]}
              onPress={handleAddRide}
            >
              <Ionicons name="car-sport-outline" size={20} color="#FFF" />
              <Text style={styles.actionBtnSecondaryText}>+ Corrida</Text>
            </Pressable>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Ganhos da Semana</Text>
              <Text style={styles.cardSubtitle}>
                Melhor resultado nos últimos 30 dias
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+18%</Text>
            </View>
          </View>
          <View style={styles.chart}>
            {WEEKLY.map((pct, i) => {
              const barH = (pct / 100) * CHART_HEIGHT;
              const isToday = i === 5;
              return (
                <View key={i} style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barH,
                        backgroundColor: isToday
                          ? YELLOW
                          : "rgba(250, 204, 21, 0.35)",
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

        {/* AI Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Resumo Inteligente</Text>
            <Ionicons name="bulb-outline" size={22} color={YELLOW} />
          </View>
          {[
            { label: "Média por hora", value: "R$ 57/h" },
            { label: "Melhor horário", value: "18h - 22h" },
            { label: "Gasto semanal", value: "R$ 682" },
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
  content: {
    paddingHorizontal: 16,
    gap: 14,
  },

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
  greeting: {
    color: MUTED,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  appTitle: {
    color: "#FFF",
    fontSize: 26,
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
  avatarText: {
    color: "#000",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },

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
  progressBadgeText: {
    color: "#000",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  progressTrack: {
    height: 12,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 6,
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: 12,
    backgroundColor: "#000",
    borderRadius: 6,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: CARD,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    gap: 8,
  },
  statLabel: {
    color: MUTED,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statValue: {
    color: YELLOW,
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },

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
  cardTitle: {
    color: "#FFF",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  cardSubtitle: {
    color: MUTED,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
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
  actionBtnPrimaryText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  actionBtnSecondary: { backgroundColor: BORDER },
  actionBtnSecondaryText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },

  badge: {
    backgroundColor: YELLOW_DIM,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: YELLOW,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },

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
  bar: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
  summaryLabel: {
    color: MUTED,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  summaryValue: {
    color: YELLOW,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
