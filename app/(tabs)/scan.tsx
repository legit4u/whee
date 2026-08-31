import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { ManualEntryScreen } from "../../src/features/scan/ManualEntryScreen";

// Simple UUID generator (v4-ish)
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ScanScreen() {
  const [mode, setMode] = useState<"menu" | "manual">("menu");
  const [deviceId] = useState(() => generateId());

  const handleManualEntry = () => {
    setMode("manual");
  };

  const handleCancel = () => {
    setMode("menu");
  };

  const handleSubmitSuccess = (billId: string) => {
    Alert.alert("Success!", "Bill saved successfully");
    setMode("menu");
  };

  if (mode === "manual") {
    return (
      <ManualEntryScreen
        onCancel={handleCancel}
        onSubmitSuccess={handleSubmitSuccess}
        anonymousDeviceId={deviceId}
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
          Scan or Add Bill
        </Text>

        <View style={{ marginBottom: 16 }}>
          <Pressable
            disabled
            style={{
              backgroundColor: "#3b82f6",
              padding: 16,
              borderRadius: 8,
              marginBottom: 12,
              opacity: 0.5
            }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "600", fontSize: 16 }}>
              📷 Scan Bill (OCR)
            </Text>
            <Text style={{ color: "white", textAlign: "center", fontSize: 12, marginTop: 8 }}>
              Coming soon: Camera + on-device OCR
            </Text>
          </Pressable>

          <Pressable
            onPress={handleManualEntry}
            style={{
              backgroundColor: "#22c55e",
              padding: 16,
              borderRadius: 8
            }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "600", fontSize: 16 }}>
              ✏️ Add Manually
            </Text>
            <Text style={{ color: "white", textAlign: "center", fontSize: 12, marginTop: 8 }}>
              Enter items without scanning
            </Text>
          </Pressable>
        </View>

        <View style={{ backgroundColor: "#f1f5f9", borderRadius: 8, padding: 16, marginTop: 24 }}>
          <Text style={{ fontWeight: "600", color: "#1e293b", marginBottom: 8 }}>
            How it works:
          </Text>
          <Text style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>
            • Add or scan items from your bill
          </Text>
          <Text style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>
            • Review and edit before submit
          </Text>
          <Text style={{ fontSize: 14, color: "#475569" }}>
            • We use your data anonymously to track prices
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
