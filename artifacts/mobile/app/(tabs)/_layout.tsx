import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

const YELLOW = "#FACC15";
const CARD = "#18181B";
const BORDER = "#27272A";
const MUTED = "#71717A";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ganhos">
        <Icon sf={{ default: "dollarsign.circle", selected: "dollarsign.circle.fill" }} />
        <Label>Ganhos</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="gastos">
        <Icon sf={{ default: "fuelpump", selected: "fuelpump.fill" }} />
        <Label>Gastos</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="relatorios">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Relatórios</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="config">
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <Label>Config</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: YELLOW,
        tabBarInactiveTintColor: MUTED,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : CARD,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: CARD }]} />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_600SemiBold",
          marginBottom: isWeb ? 10 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house.fill" tintColor={color} size={22} />
            ) : (
              <Ionicons name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="ganhos"
        options={{
          title: "Ganhos",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="dollarsign.circle.fill" tintColor={color} size={22} />
            ) : (
              <Ionicons name="cash-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="gastos"
        options={{
          title: "Gastos",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="fuelpump.fill" tintColor={color} size={22} />
            ) : (
              <Ionicons name="water-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          title: "Relatórios",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar.fill" tintColor={color} size={22} />
            ) : (
              <Ionicons name="bar-chart-outline" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: "Config",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="gearshape.fill" tintColor={color} size={22} />
            ) : (
              <Ionicons name="settings-outline" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
