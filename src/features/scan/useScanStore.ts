/**
 * Zustand store for scan flow state management.
 */

import create from "zustand";
import { BillDraft, BillLineItem, ScanFlowState, ScanError } from "./types";
import { normalize } from "@/src/lib/units";

// Simple UUID generator (v4-ish)
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface ScanStore {
  // State
  billDraft: BillDraft | null;
  flowState: ScanFlowState;
  error: ScanError | null;

  // Actions
  startScan: () => void;
  endScan: () => void;
  setFlowState: (state: ScanFlowState) => void;
  setError: (error: ScanError | null) => void;

  // Bill draft management
  setBillDraft: (bill: BillDraft) => void;
  updateLineItem: (itemId: string, updates: Partial<BillLineItem>) => void;
  removeLineItem: (itemId: string) => void;
  updateStore: (name: string, lat: number, lng: number) => void;
  updatePurchaseDate: (date: string) => void;

  // Utility
  reset: () => void;
}

const initialBillDraft: BillDraft = {
  id: generateId(),
  lineItems: [],
  store: {
    name: "",
    lat: 0,
    lng: 0
  },
  purchaseDate: new Date().toISOString().split("T")[0]
};

export const useScanStore = create<ScanStore>((set) => ({
  // Initial state
  billDraft: null,
  flowState: "idle",
  error: null,

  // Actions
  startScan: () => {
    set({ billDraft: { ...initialBillDraft }, flowState: "camera", error: null });
  },

  endScan: () => {
    set({ billDraft: null, flowState: "idle", error: null });
  },

  setFlowState: (state: ScanFlowState) => {
    set({ flowState: state });
  },

  setError: (error: ScanError | null) => {
    set({ error });
  },

  setBillDraft: (bill: BillDraft) => {
    set({ billDraft: bill });
  },

  updateLineItem: (itemId: string, updates: Partial<BillLineItem>) => {
    set((state) => {
      if (!state.billDraft) return state;

      const newLineItems = state.billDraft.lineItems.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates };

          // Auto-normalize if category, quantity, unit, or price changes
          if (
            updates.categoryId ||
            updates.rawQuantity !== undefined ||
            updates.rawUnit ||
            updates.rawPrice !== undefined
          ) {
            const categoryId = updated.categoryId;
            if (
              categoryId &&
              updated.rawQuantity !== null &&
              updated.rawUnit &&
              updated.rawPrice !== null
            ) {
              const normalized = normalize(
                categoryId,
                updated.rawQuantity,
                updated.rawUnit,
                updated.rawPrice
              );
              updated.normalizedUnit = normalized.unit;
              updated.normalizedValue = normalized.value;
            }
          }

          return updated;
        }
        return item;
      });

      return {
        billDraft: {
          ...state.billDraft,
          lineItems: newLineItems
        }
      };
    });
  },

  removeLineItem: (itemId: string) => {
    set((state) => {
      if (!state.billDraft) return state;

      return {
        billDraft: {
          ...state.billDraft,
          lineItems: state.billDraft.lineItems.filter((item) => item.id !== itemId)
        }
      };
    });
  },

  updateStore: (name: string, lat: number, lng: number) => {
    set((state) => {
      if (!state.billDraft) return state;

      return {
        billDraft: {
          ...state.billDraft,
          store: { name, lat, lng }
        }
      };
    });
  },

  updatePurchaseDate: (date: string) => {
    set((state) => {
      if (!state.billDraft) return state;

      return {
        billDraft: {
          ...state.billDraft,
          purchaseDate: date
        }
      };
    });
  },

  reset: () => {
    set({ billDraft: null, flowState: "idle", error: null });
  }
}));
