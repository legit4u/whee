/**
 * Geolocation helpers for Whee.
 * 
 * Utilities for working with geographic coordinates,
 * geohashing, and distance calculations.
 */

/**
 * Simple geohash implementation for location clustering.
 * Encodes lat/lng into a compact string for geographic indexing.
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @param precision - Geohash character precision (default: 7)
 * @returns Geohash string
 */
export function generateGeohash(
  lat: number,
  lng: number,
  precision: number = 7
): string {
  const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = "";

  let latMin = -90,
    latMax = 90;
  let lngMin = -180,
    lngMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      const mid = (lngMin + lngMax) / 2;
      if (lng > mid) {
        idx = (idx << 1) + 1;
        lngMin = mid;
      } else {
        idx = idx << 1;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat > mid) {
        idx = (idx << 1) + 1;
        latMin = mid;
      } else {
        idx = idx << 1;
        latMax = mid;
      }
    }

    evenBit = !evenBit;

    if (++bit === 5) {
      geohash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
}

/**
 * Calculate distance between two points using the Haversine formula.
 * 
 * Note: The backend should use PostGIS ST_Distance for accurate geo queries.
 * This function is primarily for client-side estimates and sorting.
 * 
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians.
 */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Check if a point is within a radius of another point.
 * 
 * @param lat - Reference latitude
 * @param lng - Reference longitude
 * @param radiusKm - Radius in kilometers
 * @param testLat - Point latitude to test
 * @param testLng - Point longitude to test
 * @returns True if the point is within the radius
 */
export function isWithinRadius(
  lat: number,
  lng: number,
  radiusKm: number,
  testLat: number,
  testLng: number
): boolean {
  const distance = haversineDistance(lat, lng, testLat, testLng);
  return distance <= radiusKm;
}

/**
 * Format distance for display (e.g. "1.2 km" or "500 m").
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Coordinates object.
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Store location metadata.
 */
export interface StoreLocation extends Coordinates {
  id: string;
  name: string;
  geohash?: string;
}

/**
 * Get a bounding box (in degrees) for a given center and radius.
 * Useful for spatial queries.
 * 
 * @param lat - Center latitude
 * @param lng - Center longitude
 * @param radiusKm - Radius in kilometers
 * @returns Object with minLat, maxLat, minLng, maxLng
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latOffset = radiusKm / 111.32; // ~111 km per degree latitude
  const lngOffset = radiusKm / (111.32 * Math.cos(toRad(lat)));

  return {
    minLat: lat - latOffset,
    maxLat: lat + latOffset,
    minLng: lng - lngOffset,
    maxLng: lng + lngOffset
  };
}
