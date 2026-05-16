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
const YELLOW_DIM = "rgba(250, 204, 21, 0.12)";
const CARD = "#18181B";
const CARD2 = "#1F1F22";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";
const DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const CHART_H = 110;

const STATUS = {
  danger:  { bg: "#FACC15", label: "Começando o dia",   icon: "rocket-outline"      as const },
  warning: { bg: "#FB923C", label: "Bom ritmo!",         icon: "trending-up-outline" as const },
  good:    { bg: "#34D399", label: "Quase na meta!",     icon: "flame-outline"       as const },
  great:   { bg: "#22C55E", label: "Meta batida! 🎉",   icon: "trophy-outline"      as const },
};

const STAT_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  horas:  { icon: "time-outline",        bg: "rgba(99,102,241,0.15)",  color: "#818CF8" },
  km:     { icon: "speedometer-outline", bg: "rgba(34,197,94,0.12)",   color: "#22C55E" },
  fuel:   { icon: "water-outline",       bg: "rgba(239,68,68,0.12)",   color: "#EF4444" },
  rides:  { icon: "navigate-outline",    bg: "rgba(250,204,21,0.12)",  color: "#FACC15" },
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const {
    driverName, dailyGoal,
    todayNetProfit, todayEarnings, todayExpenses,
    todayRides, totalKmToday, hoursOnlineToday,
    weeklyData, earningsPerHour, goalStatus, goalStreak,
    addRide, addExpense,
  } = useApp();

  const goalPct = dailyGoal > 0 ? Math.min((todayNetProfit / dailyGoal) * 100, 100) : 0;
  const maxW = Math.max(...weeklyData, 1);
  const { bg: cardBg, label: statusLabel, icon: statusIcon } = STATUS[goalStatus];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  function quickRide() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addRide({ value: 50, km: 10, durationMin: 15 });
  }
  function quickFuel() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addExpense({ label: "Abastecimento", amount: 50, category: "fuel" });
  }

  return (
    <View style={[s.root, { backgroundColor: BG }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.content,
          { paddingTop: topPad + 16, paddingBottom: 130 },
        ]}
      >
        {/* ── Header ─────────────────────────────── */}
        <View style={s.header}>
          {/* glow blob */}
          <View style={s.headerGlow} />
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{greeting}, {driverName}</Text>
            <Text style={s.appTitle}>
              CONTROLE <Text style={s.appAccent}>FINANCEIRO</Text>
            </Text>
          </View>
          <View style={s.headerRight}>
            {goalStreak > 0 && (
              <View style={s.streakPill}>
                <Ionicons name="flame" size={13} color="#FF6B35" />
                <Text style={s.streakNum}>{goalStreak}</Text>
              </View>
            )}
            <View style={s.avatar}>
              <Text style={s.avatarLetter}>
                {driverName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Profit card ─────────────────────────── */}
        <View style={[s.profitCard, { backgroundColor: cardBg }]}>
          <View style={s.cardGlow} />

          <View style={s.statusRow}>
            <View style={s.statusIconWrap}>
              <Ionicons name={statusIcon} size={14} color="rgba(0,0,0,0.6)" />
            </View>
            <Text style={s.statusLabel}>{statusLabel}</Text>
          </View>

          <Text style={s.profitSub}>Lucro Líquido Hoje</Text>
          <Text style={s.profitAmt}>R$ {todayNetProfit}</Text>

          <View style={s.profitMeta}>
            <View>
              <Text style={s.profitMetaLabel}>Meta diária</Text>
              <Text style={s.profitMetaValue}>R$ {dailyGoal}</Text>
            </View>
            <View style={s.pctBubble}>
              <Text style={s.pctText}>{Math.round(goalPct)}%</Text>
            </View>
          </View>

          <View style={s.track}>
            <View style={[s.fill, { width: `${goalPct}%` as any }]} />
          </View>

          {earningsPerHour > 0 && (
            <View style={s.rphRow}>
              <Ionicons name="time-outline" size={13} color="rgba(0,0,0,0.5)" />
              <Text style={s.rphText}>R$ {earningsPerHour}/hora</Text>
            </View>
          )}
        </View>

        {/* ── Stats grid ──────────────────────────── */}
        <View style={s.grid}>
          <RichStat
            label="Horas Online"
            value={`${hoursOnlineToday}h`}
            sub={earningsPerHour > 0 ? `R$ ${earningsPerHour}/h` : undefined}
            spec={STAT_ICONS.horas}
          />
          <RichStat
            label="KM Rodados"
            value={totalKmToday > 0 ? totalKmToday.toFixed(1) : "0"}
            spec={STAT_ICONS.km}
          />
          <RichStat
            label="Combustível"
            value={`R$ ${todayExpenses}`}
            spec={STAT_ICONS.fuel}
            warn={todayExpenses > 0 && todayExpenses >= dailyGoal * 0.3}
          />
          <RichStat
            label="Corridas"
            value={`${todayRides.length}`}
            spec={STAT_ICONS.rides}
          />
        </View>

        {/* ── Quick actions ───────────────────────── */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>Ações Rápidas</Text>
            <View style={s.flashBadge}>
              <Ionicons name="flash" size={13} color={YELLOW} />
              <Text style={s.flashText}>Rápido</Text>
            </View>
          </View>
          <View style={s.actionRow}>
            <Pressable
              style={({ pressed }) => [s.btn, s.btnYellow, pressed && s.pressed]}
              onPress={quickRide}
            >
              <Ionicons name="car-sport-outline" size={18} color="#000" />
              <Text style={s.btnYellowTxt}>+ Corrida R$50</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.btn, s.btnDark, pressed && s.pressed]}
              onPress={quickFuel}
            >
              <Ionicons name="water-outline" size={18} color="#FFF" />
              <Text style={s.btnDarkTxt}>+ Combustível</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Weekly chart ────────────────────────── */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <View>
              <Text style={s.cardTitle}>Semana</Text>
              <Text style={s.cardSub}>Últimos 7 dias</Text>
            </View>
            {todayEarnings > 0 && (
              <View style={s.greenBadge}>
                <Text style={s.greenBadgeTxt}>+R$ {todayEarnings} hoje</Text>
              </View>
            )}
          </View>

          <View style={s.chart}>
            {weeklyData.map((v, i) => {
              const h = (v / maxW) * CHART_H;
              const today = i === 6;
              return (
                <View key={i} style={s.barCol}>
                  {v > 0 && (
                    <Text style={[s.barLbl, today && { color: YELLOW }]}>
                      {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                    </Text>
                  )}
                  <View style={s.barBg}>
                    <View
                      style={[
                        s.bar,
                        {
                          height: Math.max(v > 0 ? h : 3, 3),
                          backgroundColor: today
                            ? cardBg
                            : v > 0
                            ? "rgba(250,204,21,0.3)"
                            : BORDER,
                          ...(today && {
                            shadowColor: cardBg,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 6,
                          }),
                        },
                      ]}
                    />
                  </View>
                  <Text style={[s.dayLbl, today && { color: YELLOW }]}>
                    {DAYS[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Daily summary ───────────────────────── */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>Resumo</Text>
            <Ionicons name="analytics-outline" size={18} color={MUTED} />
          </View>

          <View style={s.summaryGrid}>
            <SummaryTile label="Ganhos" value={`R$ ${todayEarnings}`} color="#22C55E" icon="arrow-up-circle-outline" />
            <SummaryTile label="Gastos"  value={`R$ ${todayExpenses}`}  color="#EF4444" icon="arrow-down-circle-outline" />
          </View>

          <View style={[s.netRow, { borderColor: `${cardBg}40` }]}>
            <View style={[s.netDot, { backgroundColor: cardBg }]} />
            <Text style={s.netLabel}>Lucro líquido</Text>
            <Text style={[s.netValue, { color: cardBg }]}>R$ {todayNetProfit}</Text>
          </View>

          {goalStreak > 0 && (
            <View style={s.streakBanner}>
              <Ionicons name="flame" size={18} color="#FF6B35" />
              <Text style={s.streakBannerTxt}>
                {goalStreak === 1
                  ? "Meta batida hoje!"
                  : `${goalStreak} dias consecutivos na meta!`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function RichStat({
  label, value, sub, spec, warn,
}: {
  label: string;
  value: string;
  sub?: string;
  spec: { icon: string; bg: string; color: string };
  warn?: boolean;
}) {
  return (
    <View style={[s.statCard, warn && s.statWarn]}>
      <View style={[s.statIconWrap, { backgroundColor: spec.bg }]}>
        <Ionicons name={spec.icon as any} size={16} color={spec.color} />
      </View>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statVal, { color: warn ? "#EF4444" : spec.color }]}>
        {value}
      </Text>
      {sub && <Text style={[s.statSub, { color: spec.color }]}>{sub}</Text>}
    </View>
  );
}

function SummaryTile({
  label, value, color, icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
}) {
  return (
    <View style={[s.sumTile, { borderColor: `${color}20` }]}>
      <View style={[s.sumIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={s.sumLabel}>{label}</Text>
      <Text style={[s.sumVal, { color }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },

  /* Header */
  header: {
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.12)",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  headerGlow: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(250,204,21,0.06)",
  },
  greeting: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  appTitle: {
    color: "#FFF",
    fontSize: 19,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    marginTop: 3,
  },
  appAccent: { color: YELLOW },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,107,53,0.15)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 3,
  },
  streakNum: { color: "#FF6B35", fontSize: 13, fontFamily: "Inter_700Bold" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: "#000", fontSize: 19, fontFamily: "Inter_700Bold" },

  /* Profit card */
  profitCard: {
    borderRadius: 32,
    padding: 22,
    overflow: "hidden",
    gap: 4,
  },
  cardGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  statusIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusLabel: {
    color: "rgba(0,0,0,0.6)",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  profitSub: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  profitAmt: {
    color: "#000",
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
    marginTop: 2,
  },
  profitMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  profitMetaLabel: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  profitMetaValue: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginTop: 1,
  },
  pctBubble: {
    backgroundColor: "rgba(0,0,0,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  pctText: { color: "#000", fontSize: 18, fontFamily: "Inter_700Bold" },
  track: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 4,
    marginTop: 12,
    overflow: "hidden",
  },
  fill: { height: 8, backgroundColor: "#000", borderRadius: 4 },
  rphRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  rphText: {
    color: "rgba(0,0,0,0.55)",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  /* Stats grid */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "48%",
    backgroundColor: CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    gap: 7,
  },
  statWarn: { borderColor: "rgba(239,68,68,0.25)" },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular" },
  statVal: { fontSize: 24, fontFamily: "Inter_700Bold", lineHeight: 28 },
  statSub: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  /* Cards */
  card: {
    backgroundColor: CARD,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    gap: 14,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTitle: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  cardSub: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  flashBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: YELLOW_DIM,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  flashText: { color: YELLOW, fontSize: 11, fontFamily: "Inter_700Bold" },
  greenBadge: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  greenBadgeTxt: { color: "#22C55E", fontSize: 11, fontFamily: "Inter_700Bold" },

  /* Actions */
  actionRow: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 16,
    gap: 6,
  },
  btnYellow: { backgroundColor: YELLOW },
  btnYellowTxt: { color: "#000", fontSize: 13, fontFamily: "Inter_700Bold" },
  btnDark: { backgroundColor: BORDER },
  btnDarkTxt: { color: "#FFF", fontSize: 13, fontFamily: "Inter_700Bold" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },

  /* Chart */
  chart: {
    height: CHART_H + 30,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
  },
  barCol: {
    flex: 1,
    height: CHART_H + 30,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
  },
  barLbl: { color: MUTED, fontSize: 8, fontFamily: "Inter_500Medium" },
  barBg: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  dayLbl: { color: MUTED, fontSize: 9, fontFamily: "Inter_600SemiBold" },

  /* Summary */
  summaryGrid: { flexDirection: "row", gap: 10 },
  sumTile: {
    flex: 1,
    backgroundColor: CARD2,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  sumIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sumLabel: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular" },
  sumVal: { fontSize: 20, fontFamily: "Inter_700Bold" },

  netRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: CARD2,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  netDot: { width: 8, height: 8, borderRadius: 4 },
  netLabel: { flex: 1, color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular" },
  netValue: { fontSize: 17, fontFamily: "Inter_700Bold" },

  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,107,53,0.1)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  streakBannerTxt: {
    color: "#FF6B35",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
});
