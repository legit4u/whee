/**
 * BillSuccessScreen - Shows success message after bill submission.
 * 
 * Displays the bill ID and lets user return to the scan menu.
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";

interface BillSuccessScreenProps {
  billId: string;
  onDone: () => void;
}

export function BillSuccessScreen({ billId, onDone }: BillSuccessScreenProps) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View
        style={{
          flex: 1,
          paddingVertical: 40,
          paddingHorizontal: 16,
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400
        }}
      >
        {/* Success icon */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#d1fae5",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24
          }}
        >
          <Text style={{ fontSize: 40 }}>✓</Text>
        </View>

        {/* Success message */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#1e293b",
            marginBottom: 8,
            textAlign: "center"
          }}
        >
          Bill Submitted!
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: "#64748b",
            marginBottom: 32,
            textAlign: "center",
            lineHeight: 20
          }}
        >
          Your bill has been saved successfully. Thank you for helping track
          prices!
        </Text>

        {/* Bill ID card */}
        <View
          style={{
            backgroundColor: "#f1f5f9",
            borderRadius: 12,
            padding: 16,
            marginBottom: 32,
            borderLeftWidth: 4,
            borderLeftColor: "#10b981",
            width: "100%"
          }}
        >
          <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
            Bill ID
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "monospace",
              color: "#1e293b",
              fontWeight: "600"
            }}
          >
            {billId}
          </Text>
        </View>

        {/* Return button */}
        <Pressable
          onPress={onDone}
          style={{
            backgroundColor: "#3b82f6",
            borderRadius: 8,
            paddingVertical: 14,
            paddingHorizontal: 24,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3
          }}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            ← Back to Menu
          </Text>
        </Pressable>

        {/* Info box */}
        <View
          style={{
            backgroundColor: "#eff6ff",
            borderRadius: 8,
            padding: 14,
            marginTop: 32,
            borderLeftWidth: 4,
            borderLeftColor: "#3b82f6"
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#1e40af",
              lineHeight: 18
            }}
          >
            Your data is completely anonymous and helps our community find the
            best prices. No personal information is ever stored.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
