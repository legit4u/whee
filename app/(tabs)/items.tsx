import { View, Text, TextInput, ScrollView } from "react-native";

export default function ItemsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Browse Items
        </Text>
        <TextInput
          placeholder="Search items..."
          style={{
            backgroundColor: "#f1f5f9",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            color: "#1e293b"
          }}
          placeholderTextColor="#94a3b8"
        />
        <View style={{ backgroundColor: "#f1f5f9", padding: 16, borderRadius: 8 }}>
          <Text style={{ color: "#475569" }}>
            Start by adding a purchase to see items here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
