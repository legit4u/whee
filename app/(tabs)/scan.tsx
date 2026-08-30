import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { ManualEntryScreen } from "@/src/features/scan/ManualEntryScreen";
import { BillStore } from "@/src/features/scan/types";
import * as Location from "expo-location";

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
  const [defaultStore, setDefaultStore] = useState<BillStore | undefined>();

  const handleManualEntry = async () => {
    // Try to get current location for default store
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setDefaultStore({
          name: "",
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
      }
    } catch (error) {
      console.log("Could not get location, proceeding without default");
    }

    setMode("manual");
  };

  const handleSubmitSuccess = (billId: string) => {
    Alert.alert(
      "Success",
      `Bill ${billId} submitted successfully!`,
      [
        {
          text: "OK",
          onPress: () => setMode("menu")
        }
      ]
    );
  };

  if (mode === "manual") {
    return (
      <ManualEntryScreen
        onCancel={() => setMode("menu")}
        onSubmitSuccess={handleSubmitSuccess}
        anonymousDeviceId={deviceId}
        defaultStore={defaultStore}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">Scan or Add Bill</Text>

        <View className="mb-4">
          <Pressable
            disabled
            className="bg-blue-500 p-4 rounded-lg mb-3 opacity-50"
          >
            <Text className="text-white text-center font-semibold text-lg">
              📷 Scan Bill (OCR)
            </Text>
            <Text className="text-white text-center text-xs mt-2">
              Coming soon: Camera + on-device OCR
            </Text>
          </Pressable>

          <Pressable
            onPress={handleManualEntry}
            className="bg-green-500 p-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-lg">
              ✏️ Add Manually
            </Text>
            <Text className="text-white text-center text-xs mt-2">
              Enter items without scanning
            </Text>
          </Pressable>
        </View>

        <View className="bg-slate-100 rounded-lg p-4 mt-6">
          <Text className="font-semibold text-slate-900 mb-2">How it works:</Text>
          <Text className="text-sm text-slate-700 mb-2">
            • Add or scan items from your bill
          </Text>
          <Text className="text-sm text-slate-700 mb-2">
            • Review and edit before submit
          </Text>
          <Text className="text-sm text-slate-700">
            • We use your data anonymously to track prices
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
