/**
 * API client configuration for Whee.
 * 
 * Provides a typed fetch wrapper with base URL from environment,
 * error handling, and type safety for all API operations.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

/**
 * Make a typed API request.
 * 
 * @param endpoint - API endpoint path (e.g., "/v1/items/search")
 * @param options - Fetch options (method, body, etc.)
 * @returns Parsed response data or throws ApiError
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error: ApiError = {
      message: `API error: ${response.statusText}`,
      status: response.status
    };
    throw error;
  }

  const data: T = await response.json();
  return data;
}

/**
 * Build query parameters string.
 */
export function buildQueryString(
  params: Record<string, string | number | undefined>
): string {
  const filtered = Object.entries(params).filter(
    ([, value]) => value !== undefined
  );
  if (filtered.length === 0) return "";
  return (
    "?" +
    filtered.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&")
  );
}
