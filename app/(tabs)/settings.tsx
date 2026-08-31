import { View, Text, ScrollView } from "react-native";

export default function SettingsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
          Settings
        </Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
            Privacy
          </Text>
          <View style={{ backgroundColor: "#f1f5f9", padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: "#475569" }}>
              Whee uses anonymous device IDs only. No personal information is collected.
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
            About
          </Text>
          <View style={{ backgroundColor: "#f1f5f9", padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: "#475569" }}>
              Version 0.0.1
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
