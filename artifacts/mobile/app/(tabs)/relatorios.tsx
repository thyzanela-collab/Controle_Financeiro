import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

const YELLOW = "#FACC15";
const CARD = "#18181B";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";
const RED = "#EF4444";
const GREEN = "#22C55E";
const BLUE = "#60A5FA";
const PURPLE = "#818CF8";
const ORANGE = "#F97316";

const DAY_NAMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const DAY_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function getLast7DateStrings(): string[] {
  const result: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

function getLast7DayLabels(): string[] {
  const result: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(DAY_NAMES[d.getDay()]);
  }
  return result;
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dayName = DAY_FULL[d.getDay()];
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${dayName}, ${day}/${month}`;
}

export default function RelatoriosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const {
    earnings, expenses, kmEntries, hoursEntries,
    dailyGoal,
    todayEarnings, todayExpenses, todayNetProfit,
    weeklyData,
    totalKmToday, hoursOnlineToday,
  } = useApp();

  const last7Dates = getLast7DateStrings();
  const dayLabels = getLast7DayLabels();

  const totalEarnings = earnings.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalProfit = totalEarnings - totalExpenses;

  const uber99Total = earnings.filter((e) => e.type === "uber99").reduce((s, e) => s + e.amount, 0);
  const particularTotal = earnings.filter((e) => e.type === "particular").reduce((s, e) => s + e.amount, 0);
  const gorjetaTotal = earnings.filter((e) => e.type === "gorjeta").reduce((s, e) => s + e.amount, 0);

  const today = new Date().toISOString().slice(0, 10);
  const todayUber = earnings.filter((e) => e.type === "uber99" && e.date === today).reduce((s, e) => s + e.amount, 0);
  const todayParticular = earnings.filter((e) => e.type === "particular" && e.date === today).reduce((s, e) => s + e.amount, 0);
  const todayGorjeta = earnings.filter((e) => e.type === "gorjeta" && e.date === today).reduce((s, e) => s + e.amount, 0);

  const weeklyTotal = weeklyData.reduce((s, v) => s + v, 0);
  const weeklyMax = Math.max(...weeklyData, 1);

  const fuelExpenses = expenses.filter((e) => e.category === "fuel").reduce((s, e) => s + e.amount, 0);
  const foodExpenses = expenses.filter((e) => e.category === "food").reduce((s, e) => s + e.amount, 0);
  const tollExpenses = expenses.filter((e) => e.category === "toll").reduce((s, e) => s + e.amount, 0);
  const otherExpenses = expenses.filter((e) => e.category === "other").reduce((s, e) => s + e.amount, 0);

  const goalProgress = dailyGoal > 0 ? Math.min((todayNetProfit / dailyGoal) * 100, 100) : 0;

  // Dados do dia selecionado
  const selectedDate = selectedIdx !== null ? last7Dates[selectedIdx] : null;
  const selEarnings = selectedDate ? earnings.filter((e) => e.date === selectedDate) : [];
  const selExpenses = selectedDate ? expenses.filter((e) => e.date === selectedDate) : [];
  const selKm = selectedDate ? kmEntries.filter((k) => k.date === selectedDate) : [];
  const selHours = selectedDate ? hoursEntries.filter((h) => h.date === selectedDate) : [];

  const selTotalEarnings = selEarnings.reduce((s, e) => s + e.amount, 0);
  const selTotalExpenses = selExpenses.reduce((s, e) => s + e.amount, 0);
  const selProfit = selTotalEarnings - selTotalExpenses;
  const selUber = selEarnings.filter((e) => e.type === "uber99").reduce((s, e) => s + e.amount, 0);
  const selParticular = selEarnings.filter((e) => e.type === "particular").reduce((s, e) => s + e.amount, 0);
  const selGorjeta = selEarnings.filter((e) => e.type === "gorjeta").reduce((s, e) => s + e.amount, 0);
  const selFuel = selExpenses.filter((e) => e.category === "fuel").reduce((s, e) => s + e.amount, 0);
  const selFood = selExpenses.filter((e) => e.category === "food").reduce((s, e) => s + e.amount, 0);
  const selToll = selExpenses.filter((e) => e.category === "toll").reduce((s, e) => s + e.amount, 0);
  const selOther = selExpenses.filter((e) => e.category === "other").reduce((s, e) => s + e.amount, 0);
  const selKmTotal = parseFloat(selKm.reduce((s, k) => s + k.km, 0).toFixed(1));
  const selHoursTotal = parseFloat(selHours.reduce((s, h) => s + h.hours, 0).toFixed(1));

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={[s.content, { paddingTop: topPad + 16, paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.pageTitle}>Relatórios</Text>

        {/* Total acumulado */}
        <View style={s.heroCard}>
          <View style={s.heroGlow} />
          <Text style={s.heroLabel}>Lucro Total Acumulado</Text>
          <Text style={s.heroAmount}>R$ {totalProfit.toFixed(2).replace(".", ",")}</Text>
          <View style={s.heroRow}>
            <View style={s.heroStat}>
              <Ionicons name="trending-up-outline" size={14} color="rgba(0,0,0,0.5)" />
              <Text style={s.heroStatText}>Ganhos: R$ {totalEarnings.toFixed(0)}</Text>
            </View>
            <View style={s.heroStat}>
              <Ionicons name="trending-down-outline" size={14} color="rgba(0,0,0,0.5)" />
              <Text style={s.heroStatText}>Gastos: R$ {totalExpenses.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        {/* Hoje */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Hoje</Text>
          <View style={s.todayGoalRow}>
            <Text style={s.todayGoalLabel}>Meta diária · R$ {dailyGoal}</Text>
            <Text style={s.todayGoalPct}>{Math.round(goalProgress)}%</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${goalProgress}%` as any }]} />
          </View>
          <View style={s.summaryGrid}>
            {[
              { label: "Ganhos",     value: `R$ ${todayEarnings}`,          color: YELLOW },
              { label: "Gastos",     value: `R$ ${todayExpenses}`,          color: RED },
              { label: "Lucro",      value: `R$ ${todayNetProfit}`,         color: GREEN },
              { label: "Horas",      value: `${hoursOnlineToday}h`,         color: PURPLE },
              { label: "KM",         value: `${totalKmToday.toFixed(0)} km`, color: GREEN },
              { label: "Uber/99",    value: `R$ ${todayUber}`,              color: BLUE },
              { label: "Particular", value: `R$ ${todayParticular}`,        color: GREEN },
              { label: "Gorjeta",    value: `R$ ${todayGorjeta}`,           color: YELLOW },
            ].map(({ label, value, color }) => (
              <View key={label} style={s.summaryCard}>
                <Text style={s.summaryCardLabel}>{label}</Text>
                <Text style={[s.summaryCardValue, { color }]}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gráfico semanal com barras clicáveis */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Últimos 7 Dias</Text>
          <Text style={s.heroAmount2}>R$ {weeklyTotal.toFixed(2).replace(".", ",")}</Text>
          <Text style={s.tapHint}>Toque em um dia para ver detalhes</Text>
          <View style={s.weekChart}>
            {weeklyData.map((val, i) => {
              const h = (val / weeklyMax) * 100;
              const isToday = i === 6;
              const isSelected = selectedIdx === i;
              return (
                <Pressable
                  key={i}
                  style={s.weekBarWrap}
                  onPress={() => setSelectedIdx(isSelected ? null : i)}
                >
                  <Text style={s.weekVal}>{val > 0 ? `${val}` : ""}</Text>
                  <View style={s.weekBarBg}>
                    <View
                      style={[
                        s.weekBar,
                        {
                          height: `${Math.max(h, 4)}%` as any,
                          backgroundColor: isSelected
                            ? "#fff"
                            : isToday
                            ? YELLOW
                            : val > 0
                            ? "rgba(250,204,21,0.4)"
                            : BORDER,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[s.weekDay, (isToday || isSelected) && { color: YELLOW }]}>
                    {dayLabels[i]}
                  </Text>
                  {isSelected && <View style={s.selectedDot} />}
                </Pressable>
              );
            })}
          </View>

          {/* Painel de detalhe do dia selecionado */}
          {selectedDate !== null && (
            <View style={s.dayDetail}>
              <View style={s.dayDetailHeader}>
                <Ionicons name="calendar-outline" size={16} color={YELLOW} />
                <Text style={s.dayDetailTitle}>{formatDateFull(selectedDate)}</Text>
                <Pressable onPress={() => setSelectedIdx(null)} style={s.closeBtn}>
                  <Ionicons name="close" size={16} color={MUTED} />
                </Pressable>
              </View>

              {selEarnings.length === 0 && selExpenses.length === 0 && selKm.length === 0 && selHours.length === 0 ? (
                <Text style={s.emptyDay}>Nenhum dado registrado neste dia.</Text>
              ) : (
                <>
                  {/* Resumo */}
                  <View style={s.dayGrid}>
                    {[
                      { label: "Ganhos",  value: `R$ ${selTotalEarnings.toFixed(2).replace(".", ",")}`, color: YELLOW },
                      { label: "Gastos",  value: `R$ ${selTotalExpenses.toFixed(2).replace(".", ",")}`, color: RED },
                      { label: "Lucro",   value: `R$ ${selProfit.toFixed(2).replace(".", ",")}`,        color: selProfit >= 0 ? GREEN : RED },
                      { label: "Horas",   value: `${selHoursTotal}h`,                                  color: PURPLE },
                      { label: "KM",      value: `${selKmTotal} km`,                                   color: BLUE },
                    ].map(({ label, value, color }) => (
                      <View key={label} style={s.dayGridCard}>
                        <Text style={s.dayGridLabel}>{label}</Text>
                        <Text style={[s.dayGridValue, { color }]}>{value}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Ganhos por modalidade */}
                  {selTotalEarnings > 0 && (
                    <View style={s.daySection}>
                      <Text style={s.daySectionTitle}>Ganhos por modalidade</Text>
                      {[
                        { label: "Uber / 99",  value: selUber,      color: BLUE,   icon: "car-sport-outline" },
                        { label: "Particular", value: selParticular, color: GREEN,  icon: "person-outline" },
                        { label: "Gorjeta",    value: selGorjeta,   color: YELLOW, icon: "gift-outline" },
                      ].filter((r) => r.value > 0).map(({ label, value, color, icon }) => (
                        <View key={label} style={s.dayBreakRow}>
                          <View style={[s.breakdownIcon, { backgroundColor: `${color}18` }]}>
                            <Ionicons name={icon as any} size={14} color={color} />
                          </View>
                          <Text style={s.dayBreakLabel}>{label}</Text>
                          <Text style={[s.dayBreakValue, { color }]}>R$ {value.toFixed(2).replace(".", ",")}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Gastos por categoria */}
                  {selTotalExpenses > 0 && (
                    <View style={s.daySection}>
                      <Text style={s.daySectionTitle}>Gastos por categoria</Text>
                      {[
                        { label: "Combustível", value: selFuel,  color: YELLOW,  icon: "water-outline" },
                        { label: "Alimentação", value: selFood,  color: ORANGE,  icon: "fast-food-outline" },
                        { label: "Pedágio",     value: selToll,  color: BLUE,    icon: "car-outline" },
                        { label: "Outros",      value: selOther, color: MUTED,   icon: "receipt-outline" },
                      ].filter((r) => r.value > 0).map(({ label, value, color, icon }) => (
                        <View key={label} style={s.dayBreakRow}>
                          <View style={[s.breakdownIcon, { backgroundColor: `${color}18` }]}>
                            <Ionicons name={icon as any} size={14} color={color} />
                          </View>
                          <Text style={s.dayBreakLabel}>{label}</Text>
                          <Text style={[s.dayBreakValue, { color }]}>R$ {value.toFixed(2).replace(".", ",")}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          )}
        </View>

        {/* Ganhos por modalidade (acumulado) */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Ganhos por Modalidade</Text>
            <Ionicons name="car-outline" size={20} color={MUTED} />
          </View>
          {[
            { label: "Uber / 99",  value: uber99Total,     color: BLUE,   icon: "car-sport-outline" },
            { label: "Particular", value: particularTotal, color: GREEN,  icon: "person-outline" },
            { label: "Gorjeta",    value: gorjetaTotal,    color: YELLOW, icon: "gift-outline" },
          ].map(({ label, value, color, icon }) => (
            <View key={label} style={s.breakdownRow}>
              <View style={[s.breakdownIcon, { backgroundColor: `${color}18` }]}>
                <Ionicons name={icon as any} size={16} color={color} />
              </View>
              <Text style={s.breakdownLabel}>{label}</Text>
              <View style={s.breakdownBarWrap}>
                <View
                  style={[
                    s.breakdownBar,
                    {
                      width: totalEarnings > 0 ? `${(value / totalEarnings) * 100}%` as any : "0%",
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={[s.breakdownValue, { color }]}>R$ {value.toFixed(0)}</Text>
            </View>
          ))}
        </View>

        {/* Gastos por categoria (acumulado) */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Gastos por Categoria</Text>
            <Ionicons name="pie-chart-outline" size={20} color={MUTED} />
          </View>
          {[
            { label: "Combustível", value: fuelExpenses,  icon: "water-outline",     color: YELLOW },
            { label: "Alimentação", value: foodExpenses,  icon: "fast-food-outline", color: ORANGE },
            { label: "Pedágio",     value: tollExpenses,  icon: "car-outline",       color: BLUE },
            { label: "Outros",      value: otherExpenses, icon: "receipt-outline",   color: MUTED },
          ].map(({ label, value, icon, color }) => (
            <View key={label} style={s.breakdownRow}>
              <View style={[s.breakdownIcon, { backgroundColor: `${color}18` }]}>
                <Ionicons name={icon as any} size={16} color={color} />
              </View>
              <Text style={s.breakdownLabel}>{label}</Text>
              <View style={s.breakdownBarWrap}>
                <View
                  style={[
                    s.breakdownBar,
                    {
                      width: totalExpenses > 0 ? `${(value / totalExpenses) * 100}%` as any : "0%",
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={[s.breakdownValue, { color }]}>R$ {value.toFixed(0)}</Text>
            </View>
          ))}
        </View>

        {/* Médias */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Totais Gerais</Text>
            <Ionicons name="analytics-outline" size={20} color={YELLOW} />
          </View>
          {[
            { label: "Total de ganhos", value: `R$ ${totalEarnings.toFixed(0)}` },
            { label: "Total de gastos", value: `R$ ${totalExpenses.toFixed(0)}` },
            { label: "Lucro acumulado", value: `R$ ${totalProfit.toFixed(0)}` },
          ].map(({ label, value }) => (
            <View key={label} style={s.avgRow}>
              <Text style={s.avgLabel}>{label}</Text>
              <Text style={s.avgValue}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14 },
  pageTitle: { color: "#FFF", fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },

  heroCard: { backgroundColor: YELLOW, borderRadius: 32, padding: 24, overflow: "hidden", gap: 8 },
  heroGlow: { position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.25)" },
  heroLabel: { color: "rgba(0,0,0,0.55)", fontSize: 13, fontFamily: "Inter_500Medium" },
  heroAmount: { color: "#000", fontSize: 40, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  heroAmount2: { color: YELLOW, fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  heroRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  heroStat: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroStatText: { color: "rgba(0,0,0,0.6)", fontSize: 13, fontFamily: "Inter_500Medium" },

  card: { backgroundColor: CARD, borderRadius: 28, borderWidth: 1, borderColor: BORDER, padding: 20, gap: 14 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },

  tapHint: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular", marginTop: -8 },

  todayGoalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  todayGoalLabel: { color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular" },
  todayGoalPct: { color: YELLOW, fontSize: 13, fontFamily: "Inter_700Bold" },
  progressTrack: { height: 8, backgroundColor: BORDER, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: YELLOW, borderRadius: 4 },

  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryCard: { width: "48%", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 16, padding: 14, gap: 6 },
  summaryCardLabel: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryCardValue: { fontSize: 18, fontFamily: "Inter_700Bold" },

  weekChart: { height: 120, flexDirection: "row", alignItems: "flex-end", gap: 6 },
  weekBarWrap: { flex: 1, height: 120, alignItems: "center", justifyContent: "flex-end", gap: 4 },
  weekVal: { color: MUTED, fontSize: 8, fontFamily: "Inter_500Medium" },
  weekBarBg: { flex: 1, width: "100%", justifyContent: "flex-end" },
  weekBar: { width: "100%", borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  weekDay: { color: MUTED, fontSize: 9, fontFamily: "Inter_600SemiBold" },
  selectedDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: YELLOW },

  dayDetail: { backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 16, gap: 14 },
  dayDetailHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  dayDetailTitle: { flex: 1, color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
  closeBtn: { padding: 4 },
  emptyDay: { color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 8 },

  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayGridCard: { width: "48%", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 12, gap: 4 },
  dayGridLabel: { color: MUTED, fontSize: 11, fontFamily: "Inter_400Regular" },
  dayGridValue: { fontSize: 16, fontFamily: "Inter_700Bold" },

  daySection: { gap: 8 },
  daySectionTitle: { color: MUTED, fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  dayBreakRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dayBreakLabel: { flex: 1, color: "#fff", fontSize: 13, fontFamily: "Inter_400Regular" },
  dayBreakValue: { fontSize: 13, fontFamily: "Inter_700Bold" },

  breakdownRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  breakdownIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  breakdownLabel: { color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular", width: 90 },
  breakdownBarWrap: { flex: 1, height: 6, backgroundColor: BORDER, borderRadius: 3, overflow: "hidden" },
  breakdownBar: { height: 6, borderRadius: 3 },
  breakdownValue: { fontSize: 13, fontFamily: "Inter_700Bold", width: 60, textAlign: "right" },

  avgRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
  },
  avgLabel: { color: MUTED, fontSize: 13, fontFamily: "Inter_400Regular" },
  avgValue: { color: YELLOW, fontSize: 14, fontFamily: "Inter_700Bold" },
});
