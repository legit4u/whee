/**
 * BillReviewScreen - Mandatory review/edit screen after OCR parsing.
 * 
 * Shows all parsed line items, store info, date, and lets user edit before submit.
 * This is the main data-quality safeguard against OCR errors.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { BillLineItem, BillStore } from "./types";
import { BillLineItemForm } from "./BillLineItemForm";
import { getAllCategories } from "@/src/lib/categories";
import { useSubmitBill } from "@/src/services/hooks";

interface BillReviewScreenProps {
  lineItems: BillLineItem[];
  store: BillStore;
  purchaseDate: string;
  onLineItemUpdate: (itemId: string, updates: Partial<BillLineItem>) => void;
  onLineItemRemove: (itemId: string) => void;
  onStoreUpdate: (name: string, lat: number, lng: number) => void;
  onDateUpdate: (date: string) => void;
  onSubmitSuccess: (billId: string) => void;
  onCancel: () => void;
  anonymousDeviceId: string;
}

export function BillReviewScreen({
  lineItems,
  store,
  purchaseDate,
  onLineItemUpdate,
  onLineItemRemove,
  onStoreUpdate,
  onDateUpdate,
  onSubmitSuccess,
  onCancel,
  anonymousDeviceId
}: BillReviewScreenProps) {
  const [storeName, setStoreName] = useState(store.name);
  const [date, setDate] = useState(purchaseDate);
  const submitBillMutation = useSubmitBill();

  // Validate before submit
  const canSubmit = () => {
    if (!storeName.trim()) {
      Alert.alert("Error", "Store name is required");
      return false;
    }

    if (lineItems.length === 0) {
      Alert.alert("Error", "Add at least one item to the bill");
      return false;
    }

    // Check all items have category and valid normalized price
    for (const item of lineItems) {
      if (!item.categoryId) {
        Alert.alert("Error", `Please select a category for "${item.itemName}"`);
        return false;
      }

      if (
        item.rawQuantity === null ||
        item.rawUnit === null ||
        item.rawPrice === null
      ) {
        Alert.alert(
          "Error",
          `Please fill in quantity, unit, and price for "${item.itemName}"`
        );
        return false;
      }

      if (item.normalizedValue === null) {
        Alert.alert(
          "Error",
          `Could not normalize price for "${item.itemName}". Please check the values.`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    try {
      console.log("[BillReviewScreen] Submitting bill...");
      const response = await submitBillMutation.mutateAsync({
        storeName: storeName.trim(),
        storeLat: store.lat,
        storeLng: store.lng,
        purchaseDate: date,
        items: lineItems.map((item) => ({
          itemName: item.itemName,
          categoryId: item.categoryId!,
          rawQuantity: item.rawQuantity!,
          rawUnit: item.rawUnit!,
          rawPrice: item.rawPrice!,
          normalizedUnit: item.normalizedUnit,
          normalizedValue: item.normalizedValue!,
          matchedItemId: undefined,
          storeId: undefined
        })),
        anonymousDeviceId
      });

      console.log("[BillReviewScreen] Bill submitted successfully:", response);
      onSubmitSuccess(response.billId);
    } catch (error) {
      console.error("[BillReviewScreen] Submission error:", error);
      // Show error in UI - for now just log
      const errorMsg = error instanceof Error ? error.message : "Failed to submit bill";
      console.error("Error details:", errorMsg);
      // TODO: Show error toast/alert to user
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="always"
      >
        <View style={{ paddingVertical: 20, paddingHorizontal: 16 }}>
        {/* Progress indicator */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#cbd5e1", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#64748b", fontWeight: "bold", fontSize: 14 }}>1</Text>
            </View>
            <View style={{ flex: 1, height: 2, backgroundColor: "#e2e8f0", marginHorizontal: 8 }} />
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>2</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: "#94a3b8" }}>Add Items</Text>
            <Text style={{ fontSize: 12, fontWeight: "500", color: "#3b82f6" }}>Review & Store</Text>
          </View>
        </View>

        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8, color: "#1e293b" }}>
          Review Your Bill
        </Text>
        <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 20 }}>
          Verify the items and store details before submitting
        </Text>

        {/* Store information card */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 16 }}>
            Store Details
          </Text>

          {/* Store name */}
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 6 }}>
              Store Name *
            </Text>
            <TextInput
              value={storeName}
              onChangeText={(text) => {
                setStoreName(text);
                onStoreUpdate(text, store.lat, store.lng);
              }}
              placeholder="e.g., Big Bazaar, Dmart"
              placeholderTextColor="#cbd5e1"
              style={{
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: storeName.trim() ? "#3b82f6" : "#e2e8f0",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 14,
                color: "#1e293b"
              }}
            />
          </View>

          {/* Date */}
          <View style={{ marginBottom: 0 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 6 }}>
              Purchase Date *
            </Text>
            <TextInput
              value={date}
              onChangeText={(text) => {
                setDate(text);
                onDateUpdate(text);
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#cbd5e1"
              style={{
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 14,
                color: "#1e293b"
              }}
            />
          </View>

          {store.lat !== 0 && store.lng !== 0 && (
            <View style={{ backgroundColor: "#f0fdf4", borderRadius: 8, padding: 10, marginTop: 12, borderLeftWidth: 4, borderLeftColor: "#10b981" }}>
              <Text style={{ fontSize: 11, color: "#166534", fontWeight: "500" }}>
                📍 Location: {store.lat.toFixed(4)}, {store.lng.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        {/* Items section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 12 }}>
            Items ({lineItems.length})
          </Text>
          <View style={{ gap: 12 }}>
            {lineItems.map((item, index) => (
              <View key={item.id} style={{ marginBottom: 0 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748b", marginBottom: 8 }}>
                  Item {index + 1}
                </Text>
                <BillLineItemForm
                  item={item}
                  onUpdate={(updates) => onLineItemUpdate(item.id, updates)}
                  onRemove={() => onLineItemRemove(item.id)}
                  showRemoveButton={lineItems.length > 1}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Summary card */}
        <View style={{ backgroundColor: "#eff6ff", borderRadius: 12, padding: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: "#3b82f6" }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#1e40af", marginBottom: 12 }}>
            Summary
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: "#1e40af" }}>
              Items:
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1e40af" }}>
              {lineItems.length} {lineItems.length === 1 ? "item" : "items"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: "#1e40af" }}>
              Store:
            </Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#1e40af" }}>
              {storeName || "Not specified"}
            </Text>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: "#93c5fd", paddingTopY: 8, marginTopY: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1e40af" }}>
                Total Value:
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#1e40af" }}>
                ₹{lineItems.reduce((sum, item) => sum + (item.rawPrice || 0), 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <Pressable
            onPress={onCancel}
            disabled={submitBillMutation.isLoading}
            style={{
              flex: 1,
              backgroundColor: "#e2e8f0",
              borderRadius: 8,
              paddingVertical: 14,
              justifyContent: "center",
              alignItems: "center",
              opacity: submitBillMutation.isLoading ? 0.5 : 1
            }}
          >
            <Text style={{ textAlign: "center", color: "#1e293b", fontWeight: "600", fontSize: 16 }}>
              ← Back
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={submitBillMutation.isLoading}
            style={{
              flex: 1,
              backgroundColor: "#10b981",
              borderRadius: 8,
              paddingVertical: 14,
              justifyContent: "center",
              alignItems: "center",
              opacity: submitBillMutation.isLoading ? 0.7 : 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3
            }}
          >
            {submitBillMutation.isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ textAlign: "center", color: "white", fontWeight: "600", fontSize: 16 }}>
                ✓ Submit Bill
              </Text>
            )}
          </Pressable>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
