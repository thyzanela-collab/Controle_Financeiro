import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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

export default function ConfigScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [notifications, setNotifications] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [goalAlert, setGoalAlert] = useState<boolean>(true);

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
        <Text style={styles.pageTitle}>Configurações</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>T</Text>
          </View>
          <View>
            <Text style={styles.profileName}>Thyago Silva</Text>
            <Text style={styles.profileSub}>Motorista Premium · 4.92 ⭐</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MUTED} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Meta Diária</Text>
          <View style={styles.goalRow}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalAmount}>R$ 600</Text>
              <Text style={styles.goalSub}>Meta atual</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}>
              <Ionicons name="create-outline" size={18} color="#000" />
              <Text style={styles.editBtnText}>Editar</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Preferências</Text>

          {[
            {
              label: "Notificações",
              sub: "Alertas de corridas e metas",
              icon: "notifications-outline",
              value: notifications,
              onChange: setNotifications,
            },
            {
              label: "Modo escuro",
              sub: "Interface escura sempre ativa",
              icon: "moon-outline",
              value: darkMode,
              onChange: setDarkMode,
            },
            {
              label: "Alerta de meta",
              sub: "Avisar ao atingir 80% da meta",
              icon: "trophy-outline",
              value: goalAlert,
              onChange: setGoalAlert,
            },
          ].map(({ label, sub, icon, value, onChange }, idx, arr) => (
            <View
              key={label}
              style={[styles.prefRow, idx < arr.length - 1 && styles.prefBorder]}
            >
              <View style={styles.prefIcon}>
                <Ionicons name={icon as any} size={18} color={YELLOW} />
              </View>
              <View style={styles.prefInfo}>
                <Text style={styles.prefLabel}>{label}</Text>
                <Text style={styles.prefSub}>{sub}</Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: BORDER, true: YELLOW }}
                thumbColor={value ? "#000" : "#FFF"}
              />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Veículo</Text>
          {[
            { label: "Honda Civic 2021", sub: "Placa · ABC-1D23", icon: "car-outline" },
            { label: "Rendimento", sub: "11.2 km/L", icon: "speedometer-outline" },
          ].map(({ label, sub, icon }, idx) => (
            <Pressable
              key={label}
              style={({ pressed }) => [
                styles.infoRow,
                idx === 0 && styles.infoBorder,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.prefIcon}>
                <Ionicons name={icon as any} size={18} color={MUTED} />
              </View>
              <View style={styles.prefInfo}>
                <Text style={styles.prefLabel}>{label}</Text>
                <Text style={styles.prefSub}>{sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={MUTED} />
            </Pressable>
          ))}
        </View>

        <Pressable style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
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

  profileCard: {
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#000", fontSize: 22, fontFamily: "Inter_700Bold" },
  profileName: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  profileSub: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  card: {
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    gap: 4,
  },
  sectionLabel: {
    color: MUTED,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalInfo: { gap: 2 },
  goalAmount: { color: "#FFF", fontSize: 28, fontFamily: "Inter_700Bold" },
  goalSub: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: YELLOW,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  editBtnText: { color: "#000", fontSize: 13, fontFamily: "Inter_700Bold" },

  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  prefBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  prefIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(250,204,21,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  prefInfo: { flex: 1, gap: 2 },
  prefLabel: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  prefSub: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular" },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  infoBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  logoutText: { color: "#EF4444", fontSize: 15, fontFamily: "Inter_700Bold" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});
