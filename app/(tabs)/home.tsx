import { View, Text, ScrollView } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Recent Activity</Text>
        <View className="bg-slate-100 p-4 rounded-lg">
          <Text className="text-slate-600">No purchases logged yet</Text>
        </View>
      </View>
    </ScrollView>
  );
}
