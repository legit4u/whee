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
    <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 16, marginBottom: 0, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}>
      {/* Item name */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 6 }}>
          Item Name *
        </Text>
        <TextInput
          value={item.itemName}
          onChangeText={(text) => onUpdate({ itemName: text })}
          placeholder="e.g., Tomato, Milk, Eggs"
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

      {/* Category picker */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 6 }}>
          Category *
        </Text>
        <Pressable
          onPress={() => setShowCategoryPicker(true)}
          style={{
            backgroundColor: "#f8fafc",
            borderWidth: 1,
            borderColor: selectedCategory ? "#3b82f6" : "#e2e8f0",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <Text style={{ color: selectedCategory ? "#1e293b" : "#94a3b8", fontSize: 14, fontWeight: "500" }}>
            {selectedCategory ? selectedCategory.label : "Select category..."}
          </Text>
          <Text style={{ fontSize: 18, color: "#94a3b8" }}>▼</Text>
        </Pressable>
      </View>

      {/* Category picker modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1e293b" }}>Select Category</Text>
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
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#f1f5f9",
                  backgroundColor: selectedCategory?.id === category.id ? "#dbeafe" : "#ffffff"
                }}
              >
                <Text style={{ fontSize: 16, color: "#1e293b", fontWeight: "500" }}>
                  {category.label}
                </Text>
                <Text style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {category.description}
                </Text>
              </Pressable>
            )}
          />
          <Pressable
            onPress={() => setShowCategoryPicker(false)}
            style={{
              backgroundColor: "#e2e8f0",
              paddingVertical: 14,
              marginHorizontal: 16,
              marginVertical: 16,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text style={{ textAlign: "center", color: "#1e293b", fontWeight: "600", fontSize: 16 }}>
              Close
            </Text>
          </Pressable>
        </View>
      </Modal>

      {/* Price details */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 8 }}>
          Price Details *
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: "500" }}>
              Qty
            </Text>
            <TextInput
              value={item.rawQuantity?.toString() ?? ""}
              onChangeText={(text) =>
                onUpdate({ rawQuantity: text ? parseFloat(text) : null })
              }
              placeholder="1"
              placeholderTextColor="#cbd5e1"
              keyboardType="decimal-pad"
              style={{
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 9,
                fontSize: 13,
                color: "#1e293b"
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: "500" }}>
              Unit
            </Text>
            <TextInput
              value={item.rawUnit ?? ""}
              onChangeText={(text) => onUpdate({ rawUnit: text })}
              placeholder="kg, L, pcs"
              placeholderTextColor="#cbd5e1"
              style={{
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 9,
                fontSize: 13,
                color: "#1e293b"
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: "500" }}>
              Price (₹)
            </Text>
            <TextInput
              value={item.rawPrice?.toString() ?? ""}
              onChangeText={(text) =>
                onUpdate({ rawPrice: text ? parseFloat(text) : null })
              }
              placeholder="100"
              placeholderTextColor="#cbd5e1"
              keyboardType="decimal-pad"
              style={{
                backgroundColor: "#f8fafc",
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 9,
                fontSize: 13,
                color: "#1e293b"
              }}
            />
          </View>
        </View>
      </View>

      {/* Normalized price display */}
      {item.normalizedValue !== null && (
        <View style={{ backgroundColor: "#eff6ff", borderRadius: 8, padding: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: "#3b82f6" }}>
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#1e40af", marginBottom: 4 }}>
            ✓ Normalized Price
          </Text>
          <Text style={{ fontSize: 14, color: "#1e40af", fontWeight: "500" }}>
            ₹{item.normalizedValue.toFixed(2)} per {item.normalizedUnit}
          </Text>
        </View>
      )}

      {/* Remove button */}
      {showRemoveButton && onRemove && (
        <Pressable
          onPress={onRemove}
          style={{
            backgroundColor: "#fee2e2",
            borderRadius: 8,
            paddingVertical: 10,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#fca5a5"
          }}
        >
          <Text style={{ color: "#dc2626", fontWeight: "600", fontSize: 14 }}>
            ✕ Remove Item
          </Text>
        </Pressable>
      )}
    </View>
  );
}
