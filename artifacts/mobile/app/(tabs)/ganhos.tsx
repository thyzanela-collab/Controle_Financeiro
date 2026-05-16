import { Ionicons } from "@expo/vector-icons";
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

type Ride = {
  id: string;
  time: string;
  value: number;
  km: number;
  duration: string;
};

const MOCK_RIDES: Ride[] = [
  { id: "1", time: "22:14", value: 38, km: 12.4, duration: "18 min" },
  { id: "2", time: "20:51", value: 22, km: 7.1, duration: "11 min" },
  { id: "3", time: "19:30", value: 45, km: 18.2, duration: "26 min" },
  { id: "4", time: "18:05", value: 31, km: 9.8, duration: "15 min" },
  { id: "5", time: "16:40", value: 18, km: 5.3, duration: "9 min" },
  { id: "6", time: "14:22", value: 55, km: 21.0, duration: "32 min" },
  { id: "7", time: "11:10", value: 29, km: 8.7, duration: "13 min" },
];

export default function GanhosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [rides] = useState<Ride[]>(MOCK_RIDES);

  const total = rides.reduce((s, r) => s + r.value, 0);
  const avgPerRide = Math.round(total / rides.length);
  const totalKm = rides.reduce((s, r) => s + r.km, 0).toFixed(1);

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
        <Text style={styles.pageTitle}>Ganhos</Text>

        <View style={styles.totalCard}>
          <View style={styles.profitGlow} />
          <Text style={styles.totalLabel}>Total Hoje</Text>
          <Text style={styles.totalAmount}>R$ {total}</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalStat}>
              <Ionicons name="car-outline" size={16} color="rgba(0,0,0,0.5)" />
              <Text style={styles.totalStatText}>{rides.length} corridas</Text>
            </View>
            <View style={styles.totalStat}>
              <Ionicons name="navigate-outline" size={16} color="rgba(0,0,0,0.5)" />
              <Text style={styles.totalStatText}>{totalKm} km</Text>
            </View>
            <View style={styles.totalStat}>
              <Ionicons name="trending-up-outline" size={16} color="rgba(0,0,0,0.5)" />
              <Text style={styles.totalStatText}>R$ {avgPerRide}/corrida</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Corridas de Hoje</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rides.length}</Text>
            </View>
          </View>

          {rides.map((ride, idx) => (
            <View
              key={ride.id}
              style={[styles.rideRow, idx < rides.length - 1 && styles.rideBorder]}
            >
              <View style={styles.rideIcon}>
                <Ionicons name="car-sport-outline" size={18} color={YELLOW} />
              </View>
              <View style={styles.rideInfo}>
                <Text style={styles.rideTime}>{ride.time}</Text>
                <Text style={styles.rideMeta}>{ride.km} km · {ride.duration}</Text>
              </View>
              <Text style={styles.rideValue}>R$ {ride.value}</Text>
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
    backgroundColor: YELLOW,
    borderRadius: 32,
    padding: 24,
    overflow: "hidden",
    gap: 6,
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
  totalLabel: { color: "rgba(0,0,0,0.55)", fontSize: 13, fontFamily: "Inter_500Medium" },
  totalAmount: { color: "#000", fontSize: 48, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  totalRow: { flexDirection: "row", gap: 16, marginTop: 10, flexWrap: "wrap" },
  totalStat: { flexDirection: "row", alignItems: "center", gap: 5 },
  totalStatText: { color: "rgba(0,0,0,0.6)", fontSize: 13, fontFamily: "Inter_500Medium" },

  card: {
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    gap: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  badge: {
    backgroundColor: YELLOW_DIM,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { color: YELLOW, fontSize: 13, fontFamily: "Inter_700Bold" },

  rideRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  rideBorder: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  rideIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: YELLOW_DIM,
    alignItems: "center",
    justifyContent: "center",
  },
  rideInfo: { flex: 1, gap: 3 },
  rideTime: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  rideMeta: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  rideValue: { color: YELLOW, fontSize: 17, fontFamily: "Inter_700Bold" },
});
