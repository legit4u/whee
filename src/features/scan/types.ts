/**
 * Shared types for the bill scanning feature.
 */

import { CanonicalUnit } from "./units";

/**
 * A bill line item after OCR parsing and user editing.
 * This is the form that gets submitted to the backend.
 */
export interface BillLineItem {
  id: string; // Client-side ID for form state
  itemName: string;
  categoryId: string; // must be non-null before submit
  rawQuantity: number | null;
  rawUnit: string | null;
  rawPrice: number | null;
  normalizedUnit: CanonicalUnit;
  normalizedValue: number | null;
}

/**
 * A store location for a bill.
 */
export interface BillStore {
  name: string;
  lat: number;
  lng: number;
}

/**
 * A bill before submission (in review screen).
 */
export interface BillDraft {
  id: string; // Client-side ID
  lineItems: BillLineItem[];
  store: BillStore;
  purchaseDate: string; // ISO date string (YYYY-MM-DD)
  imageUri?: string; // Path to the bill photo (local only, never uploaded)
}

/**
 * State of the scan flow.
 */
export type ScanFlowState =
  | "idle" // No scan in progress
  | "camera" // Camera open
  | "preview" // Reviewing captured image
  | "parsing" // Running OCR
  | "reviewing" // Review/edit screen
  | "submitting"; // Sending to backend

/**
 * Error state.
 */
export interface ScanError {
  code: string;
  message: string;
  recoverable: boolean; // Can user retry?
}
