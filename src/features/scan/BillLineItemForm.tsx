/**
 * BillLineItemForm - Form component for editing a single bill line item.
 * 
 * Used in both manual entry and OCR review screens.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  FlatList
} from "react-native";
import { BillLineItem } from "./types";
import { getAllCategories, getCategory } from "@/src/lib/categories";
import { CANONICAL_UNITS } from "@/src/lib/categories";

interface BillLineItemFormProps {
  item: BillLineItem;
  onUpdate: (updates: Partial<BillLineItem>) => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export function BillLineItemForm({
  item,
  onUpdate,
  onRemove,
  showRemoveButton = true
}: BillLineItemFormProps) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const selectedCategory = item.categoryId ? getCategory(item.categoryId) : null;
  const categories = getAllCategories();

  return (
    <View className="border border-slate-200 rounded-lg p-4 mb-4 bg-white">
      {/* Item name */}
      <Text className="text-sm font-semibold text-slate-700 mb-2">Item Name</Text>
      <TextInput
        value={item.itemName}
        onChangeText={(text) => onUpdate({ itemName: text })}
        placeholder="e.g., Tomato, Milk"
        placeholderTextColor="#cbd5e1"
        className="bg-slate-50 border border-slate-200 rounded px-3 py-2 mb-4"
      />

      {/* Category picker */}
      <Text className="text-sm font-semibold text-slate-700 mb-2">Category *</Text>
      <Pressable
        onPress={() => setShowCategoryPicker(true)}
        className="bg-slate-50 border border-slate-200 rounded px-3 py-2 mb-4"
      >
        <Text
          className={`${
            selectedCategory ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {selectedCategory ? selectedCategory.label : "Select category..."}
        </Text>
      </Pressable>

      {/* Category picker modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View className="flex-1 bg-white">
          <View className="p-4 border-b border-slate-200">
            <Text className="text-lg font-bold">Select Category</Text>
          </View>
          <FlatList
            data={categories}
            keyExtractor={(cat) => cat.id}
            renderItem={({ item: category }) => (
              <Pressable
                onPress={() => {
                  onUpdate({ categoryId: category.id });
                  setShowCategoryPicker(false);
                }}
                className="p-4 border-b border-slate-100"
              >
                <Text className="text-slate-900">{category.label}</Text>
                <Text className="text-xs text-slate-500">
                  {category.description}
                </Text>
              </Pressable>
            )}
          />
          <Pressable
            onPress={() => setShowCategoryPicker(false)}
            className="bg-slate-100 p-4 m-4 rounded"
          >
            <Text className="text-center text-slate-900 font-semibold">
              Cancel
            </Text>
          </Pressable>
        </View>
      </Modal>

      {/* Price info (raw) */}
      <Text className="text-sm font-semibold text-slate-700 mb-2">
        Raw Price Details
      </Text>
      <View className="flex-row gap-2 mb-4">
        <View className="flex-1">
          <Text className="text-xs text-slate-600 mb-1">Qty</Text>
          <TextInput
            value={item.rawQuantity?.toString() ?? ""}
            onChangeText={(text) =>
              onUpdate({ rawQuantity: text ? parseFloat(text) : null })
            }
            placeholder="1"
            placeholderTextColor="#cbd5e1"
            keyboardType="decimal-pad"
            className="bg-slate-50 border border-slate-200 rounded px-2 py-2"
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-slate-600 mb-1">Unit</Text>
          <TextInput
            value={item.rawUnit ?? ""}
            onChangeText={(text) => onUpdate({ rawUnit: text })}
            placeholder="kg, l, piece"
            placeholderTextColor="#cbd5e1"
            className="bg-slate-50 border border-slate-200 rounded px-2 py-2"
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-slate-600 mb-1">Price (₹)</Text>
          <TextInput
            value={item.rawPrice?.toString() ?? ""}
            onChangeText={(text) =>
              onUpdate({ rawPrice: text ? parseFloat(text) : null })
            }
            placeholder="100"
            placeholderTextColor="#cbd5e1"
            keyboardType="decimal-pad"
            className="bg-slate-50 border border-slate-200 rounded px-2 py-2"
          />
        </View>
      </View>

      {/* Normalized price display */}
      {item.normalizedValue !== null && (
        <View className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <Text className="text-xs font-semibold text-blue-900 mb-1">
            Normalized Price
          </Text>
          <Text className="text-sm text-blue-900">
            ₹{item.normalizedValue.toFixed(2)} per {item.normalizedUnit}
          </Text>
        </View>
      )}

      {/* Remove button */}
      {showRemoveButton && onRemove && (
        <Pressable
          onPress={onRemove}
          className="bg-red-50 border border-red-200 rounded p-3"
        >
          <Text className="text-center text-red-600 font-semibold">
            Remove Item
          </Text>
        </Pressable>
      )}
    </View>
  );
}
