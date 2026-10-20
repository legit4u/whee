import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#4C1917",
        tabBarActiveTintColor: "#B21B27",
        tabBarInactiveTintColor: "#776A68",
        tabBarIcon: () => null,
        tabBarStyle: { backgroundColor: "#FFFFFF" }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarLabel: "Scan"
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: "Items",
          tabBarLabel: "Items"
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings"
        }}
      />
    </Tabs>
  );
}
