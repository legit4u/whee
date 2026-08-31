import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarLabel: "Home"
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
