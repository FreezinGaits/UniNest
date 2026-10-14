/**
 * UniNest Genuine GPS Proximity Verification Engine
 * Strictly enforces physical arrival verification using registered property coordinates.
 * Configurable 250m geofence radius, GPS accuracy thresholds, and fail-safe handling.
 *
 * POLICY DIRECTIVE:
 * - Never substitutes campus or locality centroids for actual property coordinates.
 * - Never marks failed, out-of-range, or timed-out checks as verified.
 */

export const DEFAULT_GEOFENCE_RADIUS_METERS = 250;
export const MAX_GPS_ACCURACY_THRESHOLD_METERS = 150;

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface PropertyCoordinates {
  latitude?: number | null;
  longitude?: number | null;
}

export type ProximityErrorCode =
  | 'MISSING_PROPERTY_COORDINATES'
  | 'INVALID_USER_COORDINATES'
  | 'INACCURATE_GPS'
  | 'OUT_OF_RANGE';

export interface ProximityVerificationResult {
  verified: boolean;
  distanceMeters?: number;
  maxRadiusMeters: number;
  error?: ProximityErrorCode;
  message: string;
  userAccuracy?: number | null;
}

/**
 * Calculates great-circle distance between two GPS points using the Haversine formula (km).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verifies if user is physically within the registered property geofence.
 */
export function verifyGpsProximity(
  userCoords: Coordinates | null | undefined,
  propertyCoords: PropertyCoordinates | null | undefined,
  maxRadiusMeters: number = DEFAULT_GEOFENCE_RADIUS_METERS
): ProximityVerificationResult {
  // 1. Guard against missing or unregistered property coordinates
  if (
    !propertyCoords ||
    propertyCoords.latitude == null ||
    propertyCoords.longitude == null ||
    isNaN(Number(propertyCoords.latitude)) ||
    isNaN(Number(propertyCoords.longitude)) ||
    Math.abs(Number(propertyCoords.latitude)) > 90 ||
    Math.abs(Number(propertyCoords.longitude)) > 180
  ) {
    return {
      verified: false,
      maxRadiusMeters,
      error: 'MISSING_PROPERTY_COORDINATES',
      message:
        'This property does not have registered GPS coordinates on file. Please use the Landlord On-Site In-Person Check-In Code to verify arrival.',
    };
  }

  // 2. Guard against missing or invalid user coordinates
  if (
    !userCoords ||
    userCoords.latitude == null ||
    userCoords.longitude == null ||
    isNaN(Number(userCoords.latitude)) ||
    isNaN(Number(userCoords.longitude)) ||
    Math.abs(Number(userCoords.latitude)) > 90 ||
    Math.abs(Number(userCoords.longitude)) > 180
  ) {
    return {
      verified: false,
      maxRadiusMeters,
      error: 'INVALID_USER_COORDINATES',
      message: 'Your device location could not be determined. Please enable location services.',
    };
  }

  // 3. Guard against inaccurate GPS readings (e.g. cellular tower triangulations > 150m radius)
  if (
    userCoords.accuracy != null &&
    userCoords.accuracy > MAX_GPS_ACCURACY_THRESHOLD_METERS
  ) {
    return {
      verified: false,
      maxRadiusMeters,
      userAccuracy: userCoords.accuracy,
      error: 'INACCURATE_GPS',
      message: `GPS reading is too inaccurate (±${Math.round(userCoords.accuracy)}m). High-accuracy GPS (±150m or better) is required to unlock your move-in PIN.`,
    };
  }

  // 4. Calculate actual ground distance
  const distanceKm = calculateHaversineDistanceKm(
    Number(userCoords.latitude),
    Number(userCoords.longitude),
    Number(propertyCoords.latitude),
    Number(propertyCoords.longitude)
  );

  const distanceMeters = Math.round(distanceKm * 1000);

  if (distanceMeters <= maxRadiusMeters) {
    return {
      verified: true,
      distanceMeters,
      maxRadiusMeters,
      userAccuracy: userCoords.accuracy,
      message: `Physical proximity verified (${distanceMeters}m from property).`,
    };
  }

  const distanceFormatted =
    distanceMeters < 1000
      ? `${distanceMeters} meters`
      : `${(distanceMeters / 1000).toFixed(2)} km`;

  return {
    verified: false,
    distanceMeters,
    maxRadiusMeters,
    userAccuracy: userCoords.accuracy,
    error: 'OUT_OF_RANGE',
    message: `You are currently ${distanceFormatted} away from the property. Physical presence within ${maxRadiusMeters}m is required to unlock your move-in PIN.`,
  };
}
