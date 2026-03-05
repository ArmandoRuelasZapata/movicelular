import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        // 👇 OCULTA LA BARRA COMPLETA PARA TODAS LAS PANTALLAS
        tabBarStyle: { display: "none" },
        // 👇 OCULTA LOS BOTONES PARA TODAS LAS PANTALLAS
        tabBarButton: () => null,
      }}
    >
      {/* LoginScreen será la primera pantalla en cargar por su posición */}
      <Tabs.Screen
        name="LoginScreen"
        options={{
          title: "Login",
        }}
      />

      <Tabs.Screen
        name="inicio"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />

      {/* Agregamos el menú de moderador por si acaso */}
      <Tabs.Screen
        name="moderatorMenu"
        options={{
          title: "MenuMod",
        }}
      />
    </Tabs>
  );
}
