import { View, Text, TextInput, ScrollView } from "react-native";

export default function ItemsScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">Browse Items</Text>
        <TextInput
          placeholder="Search items..."
          className="bg-slate-100 p-3 rounded-lg mb-4 text-slate-900"
          placeholderTextColor="#94a3b8"
        />
        <View className="bg-slate-100 p-4 rounded-lg">
          <Text className="text-slate-600">
            Start by adding a purchase to see items here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
