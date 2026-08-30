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
  Alert
} from "react-native";
import { BillLineItem, BillStore } from "./types";
import { BillLineItemForm } from "./BillLineItemForm";
import { BillReviewScreen } from "./BillReviewScreen";

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
  const [isReviewMode, setIsReviewMode] = useState(false);

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
    setIsReviewMode(true);
  };

  // Show review screen
  if (isReviewMode) {
    return (
      <BillReviewScreen
        lineItems={lineItems}
        store={store}
        purchaseDate={purchaseDate}
        onLineItemUpdate={updateLineItem}
        onLineItemRemove={removeLineItem}
        onStoreUpdate={(name, lat, lng) => setStore({ name, lat, lng })}
        onDateUpdate={setPurchaseDate}
        onSubmitSuccess={onSubmitSuccess}
        onCancel={() => setIsReviewMode(false)}
        anonymousDeviceId={anonymousDeviceId}
      />
    );
  }

  // Manual entry form
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Header */}
        <Text className="text-2xl font-bold mb-6">Add Items Manually</Text>

        {/* Quick store info (can edit later) */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <Text className="text-xs text-blue-900">
            ℹ️ Enter items below. You'll be able to set store name and date in
            the next step.
          </Text>
        </View>

        {/* Add items section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold">Items ({lineItems.length})</Text>
            <Pressable
              onPress={addNewItem}
              className="bg-green-500 rounded px-3 py-2"
            >
              <Text className="text-white font-semibold text-sm">+ Add Item</Text>
            </Pressable>
          </View>

          {lineItems.length === 0 ? (
            <View className="bg-slate-100 border border-slate-300 rounded-lg p-6 items-center">
              <Text className="text-slate-600 text-center mb-4">
                No items added yet
              </Text>
              <Pressable
                onPress={addNewItem}
                className="bg-blue-500 rounded px-4 py-2"
              >
                <Text className="text-white font-semibold">Add First Item</Text>
              </Pressable>
            </View>
          ) : (
            lineItems.map((item) => (
              <BillLineItemForm
                key={item.id}
                item={item}
                onUpdate={(updates) => updateLineItem(item.id, updates)}
                onRemove={() => removeLineItem(item.id)}
                showRemoveButton={lineItems.length > 1}
              />
            ))
          )}
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-2 mb-6">
          <Pressable
            onPress={onCancel}
            className="flex-1 bg-slate-200 rounded-lg p-4"
          >
            <Text className="text-center text-slate-900 font-semibold">
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleReview}
            disabled={lineItems.length === 0}
            className={`flex-1 rounded-lg p-4 ${
              lineItems.length === 0 ? "bg-slate-300" : "bg-blue-500"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                lineItems.length === 0 ? "text-slate-600" : "text-white"
              }`}
            >
              Next: Review
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
