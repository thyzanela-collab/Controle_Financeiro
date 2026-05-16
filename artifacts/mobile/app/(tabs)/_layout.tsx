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
        tabBarShowLabel: true,
        tabBarStyle: {
          position: "absolute",
          bottom: isWeb ? 16 : 20,
          left: 16,
          right: 16,
          borderRadius: 28,
          height: isWeb ? 74 : 68,
          backgroundColor: isIOS ? "transparent" : CARD,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          borderWidth: 1,
          borderColor: BORDER,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint="dark"
              style={[StyleSheet.absoluteFill, { borderRadius: 28, overflow: "hidden" }]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: CARD, borderRadius: 28 },
              ]}
            />
          ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_600SemiBold",
          marginBottom: isWeb ? 10 : 4,
        },
        tabBarItemStyle: {
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "house.fill" : "house"}
                tintColor={color}
                size={22}
              />
            ) : (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="ganhos"
        options={{
          title: "Ganhos",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "dollarsign.circle.fill" : "dollarsign.circle"}
                tintColor={color}
                size={22}
              />
            ) : (
              <Ionicons
                name={focused ? "cash" : "cash-outline"}
                size={22}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="gastos"
        options={{
          title: "Gastos",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "fuelpump.fill" : "fuelpump"}
                tintColor={color}
                size={22}
              />
            ) : (
              <Ionicons
                name={focused ? "water" : "water-outline"}
                size={22}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          title: "Relatórios",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "chart.bar.fill" : "chart.bar"}
                tintColor={color}
                size={22}
              />
            ) : (
              <Ionicons
                name={focused ? "bar-chart" : "bar-chart-outline"}
                size={22}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: "Config",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "gearshape.fill" : "gearshape"}
                tintColor={color}
                size={22}
              />
            ) : (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={22}
                color={color}
              />
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
