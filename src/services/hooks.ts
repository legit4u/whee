/**
 * React Query hooks for Whee API operations.
 * 
 * Hooks for fetching and mutating data with automatic caching,
 * refetching, and error handling via React Query.
 */

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from "react-query";
import { apiCall, buildQueryString } from "./api";

// ============================================================================
// Type definitions
// ============================================================================

export interface PricePoint {
  id: string;
  itemId: string;
  storeId: string;
  normalizedUnit: string;
  normalizedValue: number;
  rawQuantity: number;
  rawUnit: string;
  rawPrice: number;
  purchaseDate: string;
  createdAt: string;
}

export interface Item {
  id: string;
  categoryId: string;
  name: string;
  aliases?: string[];
}

export interface Store {
  id: string;
  name: string;
  lat: number;
  lng: number;
  geohash: string;
  createdAt: string;
}

export interface Category {
  id: string;
  label: string;
  canonicalUnit: "per_100g" | "per_100ml" | "per_piece";
}

export interface ItemSearchResult {
  items: Item[];
}

export interface PriceHistoryPoint {
  date: string;
  value: number;
  storeId?: string;
  storeName?: string;
}

export interface PriceHistory {
  itemId: string;
  itemName: string;
  categoryId: string;
  canonicalUnit: string;
  history: PriceHistoryPoint[];
}

export interface NearbyCheaperStore {
  storeId: string;
  storeName: string;
  distance: number;
  price: number;
  normalizedUnit: string;
  savings: {
    absolute: number;
    percentage: number;
  };
}

export interface NearbyCheaperResult {
  itemId: string;
  itemName: string;
  currentPrice: number;
  nearby: NearbyCheaperStore[];
  isAlreadyCheapest: boolean;
}

export interface BillLineItem {
  itemName: string;
  categoryId: string;
  rawQuantity: number;
  rawUnit: string;
  rawPrice: number;
  normalizedUnit: string;
  normalizedValue: number;
  matchedItemId?: string;
  storeId?: string;
}

export interface Bill {
  id: string;
  storeName: string;
  storeLat: number;
  storeLng: number;
  purchaseDate: string;
  items: BillLineItem[];
  anonymousDeviceId: string;
}

export interface BillSubmitRequest {
  storeName: string;
  storeLat: number;
  storeLng: number;
  purchaseDate: string;
  items: BillLineItem[];
  anonymousDeviceId: string;
}

export interface BillSubmitResponse {
  billId: string;
  pricePointIds: string[];
}

export interface BillReportItem {
  itemName: string;
  paidPrice: number;
  normalizedUnit: string;
  normalizedValue: number;
  cheaperAlternative?: {
    storeName: string;
    price: number;
    savings: number;
  };
  isAlreadyCheapest: boolean;
}

export interface BillReport {
  billId: string;
  totalPaid: number;
  totalCouldHaveSaved: number;
  items: BillReportItem[];
}

// ============================================================================
// Query hooks
// ============================================================================

/**
 * Search for items by name.
 */
export function useItemSearch(
  query: string,
  enabled: boolean = true
): UseQueryResult<ItemSearchResult, Error> {
  return useQuery(
    ["items", "search", query],
    () =>
      apiCall<ItemSearchResult>(
        `/v1/items/search${buildQueryString({ q: query })}`
      ),
    {
      enabled: enabled && query.trim().length > 0,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );
}

/**
 * Get price history for an item with optional date range.
 */
export function useItemPriceHistory(
  itemId: string,
  from?: string,
  to?: string
): UseQueryResult<PriceHistory, Error> {
  return useQuery(
    ["items", itemId, "price-history", from, to],
    () =>
      apiCall<PriceHistory>(
        `/v1/items/${itemId}/price-history${buildQueryString({ from, to })}`
      ),
    {
      staleTime: 10 * 60 * 1000 // 10 minutes
    }
  );
}

/**
 * Get nearby stores with cheaper prices for an item.
 */
export function useNearbyCheaper(
  itemId: string,
  lat: number,
  lng: number,
  radiusKm: number = 5
): UseQueryResult<NearbyCheaperResult, Error> {
  return useQuery(
    ["items", itemId, "nearby-cheaper", lat, lng, radiusKm],
    () =>
      apiCall<NearbyCheaperResult>(
        `/v1/items/${itemId}/nearby-cheaper${buildQueryString({
          lat: lat.toString(),
          lng: lng.toString(),
          radiusKm: radiusKm.toString()
        })}`
      ),
    {
      staleTime: 15 * 60 * 1000 // 15 minutes
    }
  );
}

/**
 * Get all available categories.
 */
export function useCategories(): UseQueryResult<Category[], Error> {
  return useQuery(
    ["categories"],
    () => apiCall<Category[]>("/v1/categories"),
    {
      staleTime: 60 * 60 * 1000 // 1 hour (categories rarely change)
    }
  );
}

/**
 * Get bill report with per-item comparisons.
 */
export function useBillReport(billId: string): UseQueryResult<BillReport, Error> {
  return useQuery(
    ["bills", billId, "report"],
    () => apiCall<BillReport>(`/v1/bills/${billId}/report`),
    {
      staleTime: 10 * 60 * 1000 // 10 minutes
    }
  );
}

// ============================================================================
// Mutation hooks
// ============================================================================

/**
 * Submit a confirmed bill.
 */
export function useSubmitBill(): UseMutationResult<
  BillSubmitResponse,
  Error,
  BillSubmitRequest
> {
  return useMutation(
    async (bill: BillSubmitRequest) =>
      apiCall<BillSubmitResponse>("/v1/bills", {
        method: "POST",
        body: JSON.stringify(bill)
      })
  );
}
