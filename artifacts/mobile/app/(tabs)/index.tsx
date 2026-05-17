import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

const YELLOW = "#FACC15";
const YELLOW_DIM = "rgba(250,204,21,0.12)";
const CARD = "#18181B";
const CARD2 = "#1F1F22";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";
const DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const CHART_H = 110;

const STATUS = {
  danger:  { bg: "#FACC15", label: "Começando o dia",  icon: "rocket-outline"      as const },
  warning: { bg: "#FB923C", label: "Bom ritmo!",        icon: "trending-up-outline" as const },
  good:    { bg: "#34D399", label: "Quase na meta!",    icon: "flame-outline"       as const },
  great:   { bg: "#22C55E", label: "Meta batida! 🎉",  icon: "trophy-outline"      as const },
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const {
    driverName, dailyGoal,
    todayNetProfit, todayEarnings, todayExpenses,
    totalKmToday, hoursOnlineToday,
    todayKmEntries, todayHoursEntries,
    weeklyData, earningsPerHour, goalStatus, goalStreak,
    addKmEntry, updateKmEntry, removeKmEntry,
    addHoursEntry, updateHoursEntry, removeHoursEntry,
  } = useApp();

  const goalPct = dailyGoal > 0 ? Math.min((todayNetProfit / dailyGoal) * 100, 100) : 0;
  const maxW = Math.max(...weeklyData, 1);
  const { bg: cardBg, label: statusLabel, icon: statusIcon } = STATUS[goalStatus];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  // KM form state
  const [kmFormOpen, setKmFormOpen] = useState(false);
  const [kmEditId, setKmEditId] = useState<string | null>(null);
  const [kmInput, setKmInput] = useState("");

  // Hours form state
  const [hFormOpen, setHFormOpen] = useState(false);
  const [hEditId, setHEditId] = useState<string | null>(null);
  const [hInput, setHInput] = useState("");

  function openKmAdd() {
    setKmEditId(null); setKmInput(""); setKmFormOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  function openKmEdit(id: string, km: number) {
    setKmEditId(id); setKmInput(String(km)); setKmFormOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  function saveKm() {
    const v = parseFloat(kmInput);
    if (!v || v <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (kmEditId) updateKmEntry(kmEditId, v);
    else addKmEntry(v);
    setKmFormOpen(false); setKmEditId(null);
  }
  function deleteKm(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    removeKmEntry(id);
  }

  function openHAdd() {
    setHEditId(null); setHInput(""); setHFormOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  function openHEdit(id: string, hours: number) {
    setHEditId(id); setHInput(String(hours)); setHFormOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  function saveH() {
    const v = parseFloat(hInput);
    if (!v || v <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (hEditId) updateHoursEntry(hEditId, v);
    else addHoursEntry(v);
    setHFormOpen(false); setHEditId(null);
  }
  function deleteH(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    removeHoursEntry(id);
  }

  return (
    <View style={[st.root, { backgroundColor: BG }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[st.content, { paddingTop: topPad + 16, paddingBottom: 130 }]}
      >
        {/* Header */}
        <View style={st.header}>
          <View style={st.headerGlow} />
          <View style={{ flex: 1 }}>
            <Text style={st.greeting}>{greeting}, {driverName}</Text>
            <Text style={st.appTitle}>
              CONTROLE <Text style={st.appAccent}>FINANCEIRO</Text>
            </Text>
          </View>
          <View style={st.headerRight}>
            {goalStreak > 0 && (
              <View style={st.streakPill}>
                <Ionicons name="flame" size={13} color="#FF6B35" />
                <Text style={st.streakNum}>{goalStreak}</Text>
              </View>
            )}
            <View style={st.avatar}>
              <Text style={st.avatarLetter}>{driverName.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Profit card */}
        <View style={[st.profitCard, { backgroundColor: cardBg }]}>
          <View style={st.cardGlow} />
          <View style={st.statusRow}>
            <View style={st.statusIconWrap}>
              <Ionicons name={statusIcon} size={14} color="rgba(0,0,0,0.6)" />
            </View>
            <Text style={st.statusLabel}>{statusLabel}</Text>
          </View>
          <Text style={st.profitSub}>Lucro Líquido Hoje</Text>
          <Text style={st.profitAmt}>R$ {todayNetProfit}</Text>
          <View style={st.profitMeta}>
            <View>
              <Text style={st.profitMetaLabel}>Meta diária</Text>
              <Text style={st.profitMetaValue}>R$ {dailyGoal}</Text>
            </View>
            <View style={st.pctBubble}>
              <Text style={st.pctText}>{Math.round(goalPct)}%</Text>
            </View>
          </View>
          <View style={st.track}>
            <View style={[st.fill, { width: `${goalPct}%` as any }]} />
          </View>
          {earningsPerHour > 0 && (
            <View style={st.rphRow}>
              <Ionicons name="time-outline" size={13} color="rgba(0,0,0,0.5)" />
              <Text style={st.rphText}>R$ {earningsPerHour}/hora</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={st.grid}>
          <View style={[st.statCard, { borderColor: "rgba(99,102,241,0.2)" }]}>
            <View style={[st.statIconWrap, { backgroundColor: "rgba(99,102,241,0.15)" }]}>
              <Ionicons name="time-outline" size={16} color="#818CF8" />
            </View>
            <Text style={st.statLabel}>Horas Trabalhadas</Text>
            <Text style={[st.statVal, { color: "#818CF8" }]}>{hoursOnlineToday}h</Text>
            {earningsPerHour > 0 && (
              <Text style={[st.statSub, { color: "#818CF8" }]}>R$ {earningsPerHour}/h</Text>
            )}
          </View>

          <View style={[st.statCard, { borderColor: "rgba(34,197,94,0.2)" }]}>
            <View style={[st.statIconWrap, { backgroundColor: "rgba(34,197,94,0.12)" }]}>
              <Ionicons name="speedometer-outline" size={16} color="#22C55E" />
            </View>
            <Text style={st.statLabel}>KM Rodados</Text>
            <Text style={[st.statVal, { color: "#22C55E" }]}>
              {totalKmToday > 0 ? totalKmToday.toFixed(1) : "0"}
            </Text>
          </View>

          <View style={[st.statCard, st.statWide, { borderColor: todayExpenses > dailyGoal * 0.3 ? "rgba(239,68,68,0.25)" : BORDER }]}>
            <View style={[st.statIconWrap, { backgroundColor: "rgba(239,68,68,0.12)" }]}>
              <Ionicons name="water-outline" size={16} color="#EF4444" />
            </View>
            <Text style={st.statLabel}>Combustível / Gastos</Text>
            <Text style={[st.statVal, { color: "#EF4444" }]}>R$ {todayExpenses}</Text>
          </View>
        </View>

        {/* Hours management */}
        <View style={st.card}>
          <View style={st.cardHead}>
            <View style={st.cardHeadLeft}>
              <View style={[st.sectionIcon, { backgroundColor: "rgba(99,102,241,0.15)" }]}>
                <Ionicons name="time-outline" size={16} color="#818CF8" />
              </View>
              <View>
                <Text style={st.cardTitle}>Horas Trabalhadas</Text>
                <Text style={st.cardSub}>Total: {hoursOnlineToday}h hoje</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [st.addIconBtn, pressed && st.pressed]}
              onPress={openHAdd}
            >
              <Ionicons name="add" size={20} color={YELLOW} />
            </Pressable>
          </View>

          {hFormOpen && (
            <View style={st.inlineForm}>
              <TextInput
                style={st.inlineInput}
                value={hInput}
                onChangeText={setHInput}
                keyboardType="decimal-pad"
                placeholder="Horas (ex: 4.5)"
                placeholderTextColor={MUTED}
                autoFocus
              />
              <View style={st.inlineActions}>
                <Pressable style={({ pressed }) => [st.inlineCancelBtn, pressed && st.pressed]} onPress={() => setHFormOpen(false)}>
                  <Text style={st.inlineCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [st.inlineSaveBtn, pressed && st.pressed]} onPress={saveH}>
                  <Text style={st.inlineSaveText}>{hEditId ? "Salvar" : "Adicionar"}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {todayHoursEntries.length === 0 && !hFormOpen ? (
            <Pressable style={st.emptyRow} onPress={openHAdd}>
              <Ionicons name="add-circle-outline" size={18} color={MUTED} />
              <Text style={st.emptyRowText}>Adicionar horas trabalhadas</Text>
            </Pressable>
          ) : (
            todayHoursEntries.map((h, idx) => (
              <View key={h.id} style={[st.entryRow, idx < todayHoursEntries.length - 1 && st.entryBorder]}>
                <Ionicons name="time-outline" size={14} color="#818CF8" />
                <Text style={st.entryTime}>{h.time}</Text>
                <Text style={st.entryVal}>{h.hours}h</Text>
                <View style={st.entryActions}>
                  <Pressable onPress={() => openHEdit(h.id, h.hours)} hitSlop={8} style={({ pressed }) => [pressed && st.pressed]}>
                    <Ionicons name="create-outline" size={16} color={YELLOW} />
                  </Pressable>
                  <Pressable onPress={() => deleteH(h.id)} hitSlop={8} style={({ pressed }) => [pressed && st.pressed]}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        {/* KM management */}
        <View style={st.card}>
          <View style={st.cardHead}>
            <View style={st.cardHeadLeft}>
              <View style={[st.sectionIcon, { backgroundColor: "rgba(34,197,94,0.12)" }]}>
                <Ionicons name="speedometer-outline" size={16} color="#22C55E" />
              </View>
              <View>
                <Text style={st.cardTitle}>KM Rodados</Text>
                <Text style={st.cardSub}>Total: {totalKmToday > 0 ? totalKmToday.toFixed(1) : "0"} km hoje</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [st.addIconBtn, pressed && st.pressed]}
              onPress={openKmAdd}
            >
              <Ionicons name="add" size={20} color={YELLOW} />
            </Pressable>
          </View>

          {kmFormOpen && (
            <View style={st.inlineForm}>
              <TextInput
                style={st.inlineInput}
                value={kmInput}
                onChangeText={setKmInput}
                keyboardType="decimal-pad"
                placeholder="KM percorridos (ex: 80)"
                placeholderTextColor={MUTED}
                autoFocus
              />
              <View style={st.inlineActions}>
                <Pressable style={({ pressed }) => [st.inlineCancelBtn, pressed && st.pressed]} onPress={() => setKmFormOpen(false)}>
                  <Text style={st.inlineCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [st.inlineSaveBtn, pressed && st.pressed]} onPress={saveKm}>
                  <Text style={st.inlineSaveText}>{kmEditId ? "Salvar" : "Adicionar"}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {todayKmEntries.length === 0 && !kmFormOpen ? (
            <Pressable style={st.emptyRow} onPress={openKmAdd}>
              <Ionicons name="add-circle-outline" size={18} color={MUTED} />
              <Text style={st.emptyRowText}>Adicionar km rodados</Text>
            </Pressable>
          ) : (
            todayKmEntries.map((k, idx) => (
              <View key={k.id} style={[st.entryRow, idx < todayKmEntries.length - 1 && st.entryBorder]}>
                <Ionicons name="navigate-outline" size={14} color="#22C55E" />
                <Text style={st.entryTime}>{k.time}</Text>
                <Text style={st.entryVal}>{k.km} km</Text>
                <View style={st.entryActions}>
                  <Pressable onPress={() => openKmEdit(k.id, k.km)} hitSlop={8} style={({ pressed }) => [pressed && st.pressed]}>
                    <Ionicons name="create-outline" size={16} color={YELLOW} />
                  </Pressable>
                  <Pressable onPress={() => deleteKm(k.id)} hitSlop={8} style={({ pressed }) => [pressed && st.pressed]}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Weekly chart */}
        <View style={st.card}>
          <View style={st.cardHead}>
            <View>
              <Text style={st.cardTitle}>Semana</Text>
              <Text style={st.cardSub}>Últimos 7 dias</Text>
            </View>
            {todayEarnings > 0 && (
              <View style={st.greenBadge}>
                <Text style={st.greenBadgeTxt}>+R$ {todayEarnings} hoje</Text>
              </View>
            )}
          </View>
          <View style={st.chart}>
            {weeklyData.map((v, i) => {
              const h = (v / maxW) * CHART_H;
              const today = i === 6;
              return (
                <View key={i} style={st.barCol}>
                  {v > 0 && <Text style={[st.barLbl, today && { color: YELLOW }]}>{v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}</Text>}
                  <View style={st.barBg}>
                    <View style={[st.bar, { height: Math.max(v > 0 ? h : 3, 3), backgroundColor: today ? cardBg : v > 0 ? "rgba(250,204,21,0.3)" : BORDER }]} />
                  </View>
                  <Text style={[st.dayLbl, today && { color: YELLOW }]}>{DAYS[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        <View style={st.card}>
          <Text style={st.cardTitle}>Resumo do Dia</Text>
          <View style={st.summaryGrid}>
            <SumTile label="Ganhos" value={`R$ ${todayEarnings}`} color="#22C55E" icon="arrow-up-circle-outline" />
            <SumTile label="Gastos"  value={`R$ ${todayExpenses}`}  color="#EF4444" icon="arrow-down-circle-outline" />
          </View>
          <View style={[st.netRow, { borderColor: `${cardBg}40` }]}>
            <View style={[st.netDot, { backgroundColor: cardBg }]} />
            <Text style={st.netLabel}>Lucro líquido</Text>
            <Text style={[st.netValue, { color: cardBg }]}>R$ {todayNetProfit}</Text>
          </View>
          {goalStreak > 0 && (
            <View style={st.streakBanner}>
              <Ionicons name="flame" size={18} color="#FF6B35" />
              <Text style={st.streakBannerTxt}>
                {goalStreak === 1 ? "Meta batida hoje!" : `${goalStreak} dias consecutivos na meta!`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SumTile({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <View style={[st.sumTile, { borderColor: `${color}20` }]}>
      <View style={[st.sumIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={st.sumLabel}>{label}</Text>
      <Text style={[st.sumVal, { color }]}>{value}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },

  header: {
    backgroundColor: CARD, borderRadius: 28,
    borderWidth: 1, borderColor: "rgba(250,204,21,0.12)",
    padding: 20, flexDirection: "row", alignItems: "center", gap: 12, overflow: "hidden",
  },
  headerGlow: {
    position: "absolute", top: -40, left: -40,
    width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(250,204,21,0.06)",
  },
  greeting: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  appTitle: { color: "#FFF", fontSize: 19, fontFamily: "Inter_700Bold", letterSpacing: 0.5, marginTop: 3 },
  appAccent: { color: YELLOW },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakPill: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,107,53,0.15)", borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 5, gap: 3,
  },
  streakNum: { color: "#FF6B35", fontSize: 13, fontFamily: "Inter_700Bold" },
  avatar: {
    width: 44, height: 44, borderRadius: 15,
    backgroundColor: YELLOW, alignItems: "center", justifyContent: "center",
  },
  avatarLetter: { color: "#000", fontSize: 19, fontFamily: "Inter_700Bold" },

  profitCard: { borderRadius: 32, padding: 22, overflow: "hidden", gap: 4 },
  cardGlow: {
    position: "absolute", top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80, backgroundColor: "rgba(255,255,255,0.18)",
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  statusIconWrap: { width: 22, height: 22, borderRadius: 7, backgroundColor: "rgba(0,0,0,0.1)", alignItems: "center", justifyContent: "center" },
  statusLabel: { color: "rgba(0,0,0,0.6)", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  profitSub: { color: "rgba(0,0,0,0.5)", fontSize: 13, fontFamily: "Inter_400Regular" },
  profitAmt: { color: "#000", fontSize: 48, fontFamily: "Inter_700Bold", letterSpacing: -1.5, marginTop: 2 },
  profitMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  profitMetaLabel: { color: "rgba(0,0,0,0.5)", fontSize: 11, fontFamily: "Inter_400Regular" },
  profitMetaValue: { color: "#000", fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 1 },
  pctBubble: { backgroundColor: "rgba(0,0,0,0.12)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14 },
  pctText: { color: "#000", fontSize: 18, fontFamily: "Inter_700Bold" },
  track: { height: 8, backgroundColor: "rgba(0,0,0,0.12)", borderRadius: 4, marginTop: 12, overflow: "hidden" },
  fill: { height: 8, backgroundColor: "#000", borderRadius: 4 },
  rphRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  rphText: { color: "rgba(0,0,0,0.55)", fontSize: 12, fontFamily: "Inter_600SemiBold" },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "48%", backgroundColor: CARD, borderRadius: 22,
    borderWidth: 1, borderColor: BORDER, padding: 16, gap: 7,
  },
  statWide: { width: "100%" },
  statIconWrap: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  statLabel: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular" },
  statVal: { fontSize: 24, fontFamily: "Inter_700Bold", lineHeight: 28 },
  statSub: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  statWarn: { borderColor: "rgba(239,68,68,0.25)" },

  card: { backgroundColor: CARD, borderRadius: 26, borderWidth: 1, borderColor: BORDER, padding: 18, gap: 12 },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardHeadLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  sectionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
  cardSub: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  addIconBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: YELLOW_DIM, borderWidth: 1, borderColor: "rgba(250,204,21,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  greenBadge: { backgroundColor: "rgba(34,197,94,0.12)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  greenBadgeTxt: { color: "#22C55E", fontSize: 11, fontFamily: "Inter_700Bold" },

  inlineForm: { gap: 10 },
  inlineInput: {
    backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
    color: "#FFF", fontSize: 16, fontFamily: "Inter_500Medium",
  },
  inlineActions: { flexDirection: "row", gap: 8 },
  inlineCancelBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingVertical: 12, alignItems: "center" },
  inlineCancelText: { color: MUTED, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  inlineSaveBtn: { flex: 2, backgroundColor: YELLOW, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  inlineSaveText: { color: "#000", fontSize: 13, fontFamily: "Inter_700Bold" },

  emptyRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 12, paddingHorizontal: 4,
  },
  emptyRowText: { color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular" },

  entryRow: {
    flexDirection: "row", alignItems: "center",
    gap: 8, paddingVertical: 10,
  },
  entryBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  entryTime: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  entryVal: { color: "#FFF", fontSize: 14, fontFamily: "Inter_700Bold" },
  entryActions: { flexDirection: "row", gap: 8 },

  chart: { height: CHART_H + 30, flexDirection: "row", alignItems: "flex-end", gap: 5 },
  barCol: { flex: 1, height: CHART_H + 30, alignItems: "center", justifyContent: "flex-end", gap: 3 },
  barLbl: { color: MUTED, fontSize: 8, fontFamily: "Inter_500Medium" },
  barBg: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  dayLbl: { color: MUTED, fontSize: 9, fontFamily: "Inter_600SemiBold" },

  summaryGrid: { flexDirection: "row", gap: 10 },
  sumTile: { flex: 1, backgroundColor: CARD2, borderRadius: 18, borderWidth: 1, padding: 14, gap: 8 },
  sumIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  sumLabel: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular" },
  sumVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  netRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: CARD2, borderRadius: 16, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  netDot: { width: 8, height: 8, borderRadius: 4 },
  netLabel: { flex: 1, color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular" },
  netValue: { fontSize: 17, fontFamily: "Inter_700Bold" },
  streakBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,107,53,0.1)", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(255,107,53,0.2)",
    paddingHorizontal: 14, paddingVertical: 11,
  },
  streakBannerTxt: { color: "#FF6B35", fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
});
