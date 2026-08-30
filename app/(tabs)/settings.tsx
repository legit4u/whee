import { View, Text, ScrollView } from "react-native";

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">Settings</Text>
        
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Privacy</Text>
          <View className="bg-slate-100 p-3 rounded-lg">
            <Text className="text-sm text-slate-700">
              Whee uses anonymous device IDs only. No personal information is collected.
            </Text>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">About</Text>
          <View className="bg-slate-100 p-3 rounded-lg">
            <Text className="text-sm text-slate-700">Version 0.0.1</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
