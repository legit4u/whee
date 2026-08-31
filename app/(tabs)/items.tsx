import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, FlatList } from "react-native";
import { useState } from "react";
import { useItemSearch } from "../../src/services/hooks";

export default function ItemsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useItemSearch(searchQuery);

  const items = data?.items || [];

  const renderItem = ({ item }: { item: any }) => {
    const avgPrice = 
      items.length > 0
        ? (
            item.pricePoints.reduce((sum: number, p: any) => sum + p.normalizedValue, 0) /
            item.pricePoints.length
          ).toFixed(2)
        : "0.00";

    const lowestPrice = Math.min(...item.pricePoints.map((p: any) => p.normalizedValue)).toFixed(2);
    const highestPrice = Math.max(...item.pricePoints.map((p: any) => p.normalizedValue)).toFixed(2);

    return (
      <Pressable
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2
        }}
      >
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#1e293b" }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            {item.categoryId} • {item.pricePoints.length} price{item.pricePoints.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: "500" }}>
              Avg Price
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#1e293b" }}>
              ₹{avgPrice}
            </Text>
            <Text style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
              per {item.pricePoints[0]?.normalizedUnit}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: "500" }}>
              Lowest
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#10b981" }}>
              ₹{lowestPrice}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: "500" }}>
              Highest
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#ef4444" }}>
              ₹{highestPrice}
            </Text>
          </View>
        </View>

        {/* All price points */}
        {item.pricePoints.length > 0 && (
          <View style={{ marginTop: 8, gap: 8 }}>
            <Text style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: "500" }}>
              Price Points
            </Text>
            {item.pricePoints.map((pp: any, idx: number) => (
              <View
                key={idx}
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: 8,
                  padding: 10,
                  borderLeftWidth: 3,
                  borderLeftColor: idx === 0 ? "#3b82f6" : "#cbd5e1"
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: "#1e293b" }}>
                    ₹{pp.normalizedValue.toFixed(2)} at {pp.storeName}
                  </Text>
                  <Text style={{ fontSize: 10, color: "#94a3b8" }}>
                    {pp.purchaseDate}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Header */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8, color: "#1e293b" }}>
              Prices
            </Text>
            <Text style={{ fontSize: 14, color: "#64748b" }}>
              Browse prices you and others have added
            </Text>
          </View>

          {/* Search bar */}
          <TextInput
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="done"
            onSubmitEditing={(e) => e.currentTarget.blur?.()}
            style={{
              backgroundColor: "#f1f5f9",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              color: "#1e293b",
              borderWidth: 1,
              borderColor: searchQuery ? "#3b82f6" : "#e2e8f0"
            }}
            placeholderTextColor="#94a3b8"
          />

          {/* Loading state */}
          {isLoading && (
            <View style={{ justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ marginTop: 12, color: "#64748b" }}>Loading prices...</Text>
            </View>
          )}

          {/* Error state */}
          {error && (
            <View style={{ backgroundColor: "#fee2e2", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <Text style={{ color: "#dc2626", fontWeight: "500" }}>
                Error loading items. Please try again.
              </Text>
            </View>
          )}

          {/* Empty state */}
          {!isLoading && !error && items.length === 0 && (
            <View style={{ backgroundColor: "#f1f5f9", borderRadius: 8, padding: 32, alignItems: "center" }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4, textAlign: "center" }}>
                No prices yet
              </Text>
              <Text style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>
                Prices will appear here once you start adding bills
              </Text>
            </View>
          )}

          {/* Items list */}
          {!isLoading && items.length > 0 && (
            <View>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748b", marginBottom: 12 }}>
                {items.length} item{items.length !== 1 ? "s" : ""} found
              </Text>
              {items.map((item: any) => (
                <View key={item.id}>
                  {renderItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

