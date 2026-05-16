import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

const YELLOW = "#FACC15";
const CARD = "#18181B";
const BORDER = "#27272A";
const MUTED = "#71717A";
const BG = "#000000";

export default function ConfigScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { driverName, dailyGoal, setDailyGoal, setDriverName, rides, expenses } = useApp();

  const [notifications, setNotifications] = useState(true);
  const [goalAlert, setGoalAlert] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(driverName);

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(dailyGoal));

  function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      Alert.alert("Nome inválido", "Informe seu nome.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDriverName(trimmed);
    setEditingName(false);
  }

  function handleSaveGoal() {
    const g = parseFloat(goalInput);
    if (!g || g <= 0) {
      Alert.alert("Meta inválida", "Informe um valor maior que zero.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDailyGoal(g);
    setEditingGoal(false);
  }

  function handleClearData() {
    Alert.alert(
      "Apagar todos os dados",
      `Isso vai remover ${rides.length} corridas e ${expenses.length} gastos. Essa ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar tudo",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Funcionalidade reservada",
              "Para apagar os dados, reinstale o aplicativo."
            );
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>Configurações</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>
              {driverName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{driverName}</Text>
            <Text style={styles.profileSub}>
              {rides.length} corridas · {expenses.length} gastos registrados
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.editIcon, pressed && styles.pressed]}
            onPress={() => {
              setNameInput(driverName);
              setEditingName(true);
            }}
          >
            <Ionicons name="create-outline" size={20} color={YELLOW} />
          </Pressable>
        </View>

        {editingName && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Seu nome</Text>
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Digite seu nome"
              placeholderTextColor={MUTED}
              autoFocus
            />
            <View style={styles.formActions}>
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                onPress={() => setEditingName(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
                onPress={handleSaveName}
              >
                <Ionicons name="checkmark" size={18} color="#000" />
                <Text style={styles.saveBtnText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Meta Diária</Text>
          {editingGoal ? (
            <>
              <TextInput
                style={styles.input}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="decimal-pad"
                placeholder="Ex: 600"
                placeholderTextColor={MUTED}
                autoFocus
              />
              <View style={styles.formActions}>
                <Pressable
                  style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
                  onPress={() => setEditingGoal(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
                  onPress={handleSaveGoal}
                >
                  <Ionicons name="checkmark" size={18} color="#000" />
                  <Text style={styles.saveBtnText}>Salvar</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.goalRow}>
              <View>
                <Text style={styles.goalAmount}>R$ {dailyGoal}</Text>
                <Text style={styles.goalSub}>Meta de lucro líquido diário</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
                onPress={() => {
                  setGoalInput(String(dailyGoal));
                  setEditingGoal(true);
                }}
              >
                <Ionicons name="create-outline" size={16} color="#000" />
                <Text style={styles.editBtnText}>Editar</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Preferências</Text>
          {[
            {
              label: "Notificações",
              sub: "Alertas e lembretes",
              icon: "notifications-outline",
              value: notifications,
              onChange: setNotifications,
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
                onValueChange={(v) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onChange(v);
                }}
                trackColor={{ false: BORDER, true: YELLOW }}
                thumbColor={value ? "#000" : "#FFF"}
              />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Dados</Text>
          <View style={styles.dataRow}>
            <Ionicons name="car-outline" size={18} color={MUTED} />
            <Text style={styles.dataLabel}>{rides.length} corridas registradas</Text>
          </View>
          <View style={[styles.dataRow, styles.dataBorder]}>
            <Ionicons name="receipt-outline" size={18} color={MUTED} />
            <Text style={styles.dataLabel}>{expenses.length} gastos registrados</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.dangerBtn, pressed && styles.pressed]}
            onPress={handleClearData}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.dangerBtnText}>Apagar todos os dados</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  profileSub: {
    color: MUTED,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  editIcon: { padding: 8 },

  card: {
    backgroundColor: CARD,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    gap: 12,
  },
  cardTitle: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionLabel: {
    color: MUTED,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  input: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  formActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: { color: MUTED, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    flex: 2,
    backgroundColor: YELLOW,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveBtnText: { color: "#000", fontSize: 14, fontFamily: "Inter_700Bold" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },

  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalAmount: { color: "#FFF", fontSize: 28, fontFamily: "Inter_700Bold" },
  goalSub: { color: MUTED, fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: YELLOW,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  editBtnText: { color: "#000", fontSize: 13, fontFamily: "Inter_700Bold" },

  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
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

  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  dataBorder: { borderTopWidth: 1, borderTopColor: BORDER },
  dataLabel: { color: MUTED, fontSize: 14, fontFamily: "Inter_400Regular" },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    marginTop: 4,
  },
  dangerBtnText: { color: "#EF4444", fontSize: 14, fontFamily: "Inter_700Bold" },
});
