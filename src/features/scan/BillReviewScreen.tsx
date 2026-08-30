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
  ActivityIndicator
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

      Alert.alert("Success", "Bill submitted successfully!", [
        {
          text: "OK",
          onPress: () => onSubmitSuccess(response.billId)
        }
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to submit bill"
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Header */}
        <Text className="text-2xl font-bold mb-6">Review Your Bill</Text>

        {/* Store info */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Store Information</Text>
          <View className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <Text className="text-xs text-slate-600 mb-1">Store Name</Text>
            <TextInput
              value={storeName}
              onChangeText={(text) => {
                setStoreName(text);
                onStoreUpdate(text, store.lat, store.lng);
              }}
              placeholder="Enter store name"
              placeholderTextColor="#cbd5e1"
              className="bg-white border border-slate-200 rounded px-3 py-2 mb-3"
            />

            <Text className="text-xs text-slate-600 mb-1">Date</Text>
            <TextInput
              value={date}
              onChangeText={(text) => {
                setDate(text);
                onDateUpdate(text);
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#cbd5e1"
              className="bg-white border border-slate-200 rounded px-3 py-2"
            />

            {store.lat !== 0 && store.lng !== 0 && (
              <Text className="text-xs text-slate-500 mt-2">
                Location: {store.lat.toFixed(4)}, {store.lng.toFixed(4)}
              </Text>
            )}
          </View>
        </View>

        {/* Line items */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Items ({lineItems.length})</Text>
          {lineItems.map((item) => (
            <BillLineItemForm
              key={item.id}
              item={item}
              onUpdate={(updates) => onLineItemUpdate(item.id, updates)}
              onRemove={() => onLineItemRemove(item.id)}
              showRemoveButton={lineItems.length > 1}
            />
          ))}
        </View>

        {/* Summary */}
        <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <Text className="text-sm font-semibold text-green-900 mb-2">
            Summary
          </Text>
          <Text className="text-sm text-green-900">
            {lineItems.length} item{lineItems.length !== 1 ? "s" : ""} from{" "}
            {storeName}
          </Text>
          <Text className="text-xs text-green-700 mt-2">
            Total value: ₹
            {lineItems
              .reduce((sum, item) => sum + (item.rawPrice || 0), 0)
              .toFixed(2)}
          </Text>
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
            onPress={handleSubmit}
            disabled={submitBillMutation.isLoading}
            className="flex-1 bg-blue-500 rounded-lg p-4"
          >
            {submitBillMutation.isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-white font-semibold">
                Submit Bill
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
