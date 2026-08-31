/**
 * ManualEntryScreen - Allows users to manually add items without scanning.
 * 
 * Reuses the same review/edit form and normalization logic as the scanned bill.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { BillLineItem, BillStore } from "./types";
import { BillLineItemForm } from "./BillLineItemForm";
import { BillReviewScreen } from "./BillReviewScreen";
import { BillSuccessScreen } from "./BillSuccessScreen";

// Simple UUID generator (v4-ish)
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface ManualEntryScreenProps {
  onCancel: () => void;
  onSubmitSuccess: (billId: string) => void;
  anonymousDeviceId: string;
  defaultStore?: BillStore;
}

export function ManualEntryScreen({
  onCancel,
  onSubmitSuccess,
  anonymousDeviceId,
  defaultStore
}: ManualEntryScreenProps) {
  const [lineItems, setLineItems] = useState<BillLineItem[]>([]);
  const [store, setStore] = useState<BillStore>(
    defaultStore || {
      name: "",
      lat: 0,
      lng: 0
    }
  );
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [mode, setMode] = useState<"entry" | "review" | "success">("entry");
  const [successBillId, setSuccessBillId] = useState<string>("");

  const addNewItem = () => {
    const newItem: BillLineItem = {
      id: `item-${generateId()}`,
      itemName: "",
      categoryId: "",
      rawQuantity: null,
      rawUnit: null,
      rawPrice: null,
      normalizedUnit: "per_100g",
      normalizedValue: null
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (itemId: string, updates: Partial<BillLineItem>) => {
    setLineItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const removeLineItem = (itemId: string) => {
    setLineItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const handleReview = () => {
    if (lineItems.length === 0) {
      Alert.alert("Error", "Add at least one item before reviewing");
      return;
    }
    setMode("review");
  };

  const handleSubmitSuccess = (billId: string) => {
    setSuccessBillId(billId);
    setMode("success");
  };

  // Show success screen
  if (mode === "success") {
    return (
      <BillSuccessScreen
        billId={successBillId}
        onDone={() => {
          onSubmitSuccess(successBillId);
        }}
      />
    );
  }

  // Show review screen
  if (mode === "review") {
    return (
      <BillReviewScreen
        lineItems={lineItems}
        store={store}
        purchaseDate={purchaseDate}
        onLineItemUpdate={updateLineItem}
        onLineItemRemove={removeLineItem}
        onStoreUpdate={(name, lat, lng) => setStore({ name, lat, lng })}
        onDateUpdate={setPurchaseDate}
        onSubmitSuccess={handleSubmitSuccess}
        onCancel={() => setMode("entry")}
        anonymousDeviceId={anonymousDeviceId}
      />
    );
  }

  // Manual entry form
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
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>1</Text>
            </View>
            <View style={{ flex: 1, height: 2, backgroundColor: "#e2e8f0", marginHorizontal: 8 }} />
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#cbd5e1", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#64748b", fontWeight: "bold", fontSize: 14 }}>2</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: "#3b82f6" }}>Add Items</Text>
            <Text style={{ fontSize: 12, fontWeight: "500", color: "#94a3b8" }}>Review & Store</Text>
          </View>
        </View>

        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8, color: "#1e293b" }}>
          Add Items
        </Text>
        <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 20 }}>
          Enter what you bought. You'll set the store and date on the next screen.
        </Text>

        {/* Quick tips */}
        <View style={{ backgroundColor: "#dbeafe", borderRadius: 8, padding: 12, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: "#3b82f6" }}>
          <Text style={{ fontSize: 13, color: "#1e40af", fontWeight: "500" }}>
            💡 Tip: Include quantity, unit (kg, piece, L), and price for each item
          </Text>
        </View>

        {/* Items section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#1e293b" }}>Items</Text>
              <Text style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                {lineItems.length} {lineItems.length === 1 ? "item" : "items"} added
              </Text>
            </View>
            <Pressable
              onPress={addNewItem}
              style={{
                backgroundColor: "#10b981",
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3
              }}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                + Add Item
              </Text>
            </Pressable>
          </View>

          {lineItems.length === 0 ? (
            <View style={{ backgroundColor: "#f8fafc", borderRadius: 12, padding: 32, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#e2e8f0", borderStyle: "dashed" }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📝</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4, textAlign: "center" }}>
                No items yet
              </Text>
              <Text style={{ fontSize: 13, color: "#64748b", marginBottom: 16, textAlign: "center" }}>
                Tap "Add Item" to get started
              </Text>
              <Pressable
                onPress={addNewItem}
                style={{
                  backgroundColor: "#3b82f6",
                  borderRadius: 8,
                  paddingHorizontal: 24,
                  paddingVertical: 12
                }}
              >
                <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                  Add First Item
                </Text>
              </Pressable>
            </View>
          ) : (
            <View>
              {lineItems.map((item, index) => (
                <View key={item.id} style={{ marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#64748b", marginBottom: 8 }}>
                    Item {index + 1}
                  </Text>
                  <BillLineItemForm
                    item={item}
                    onUpdate={(updates) => updateLineItem(item.id, updates)}
                    onRemove={() => removeLineItem(item.id)}
                    showRemoveButton={lineItems.length > 1}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <Pressable
            onPress={onCancel}
            style={{
              flex: 1,
              backgroundColor: "#e2e8f0",
              borderRadius: 8,
              paddingVertical: 14,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text style={{ textAlign: "center", color: "#1e293b", fontWeight: "600", fontSize: 16 }}>
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleReview}
            disabled={lineItems.length === 0}
            style={{
              flex: 1,
              backgroundColor: lineItems.length === 0 ? "#cbd5e1" : "#3b82f6",
              borderRadius: 8,
              paddingVertical: 14,
              justifyContent: "center",
              alignItems: "center",
              opacity: lineItems.length === 0 ? 0.6 : 1
            }}
          >
            <Text style={{ textAlign: "center", color: "white", fontWeight: "600", fontSize: 16 }}>
              Next: Review →
            </Text>
          </Pressable>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

