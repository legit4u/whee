/**
 * Shared types for server API
 */

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

export interface ItemSearchResult {
  query: string;
  items: Array<{
    id: string;
    name: string;
    categoryId: string;
    pricePoints: Array<{
      normalizedValue: number;
      normalizedUnit: string;
      storeName: string;
      purchaseDate: string;
      rawPrice: number;
      rawUnit: string;
      rawQuantity: number;
    }>;
  }>;
  total: number;
}
