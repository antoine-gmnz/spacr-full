/**
 * Aurora DTOs for NOAA SWPC data
 */

export interface AuroraPoint {
  longitude: number;
  latitude: number;
  aurora: number; // 0-100 probability percentage
}

export interface AuroraData {
  observationTime: string;
  forecastTime: string;
  coordinates: AuroraPoint[];
  kpIndex: number;
  kpTimestamp: string;
}

export interface AuroraVisibility {
  visible: boolean;
  probability: number;
  kpIndex: number;
  message: string;
  nearbyMaxProbability: number;
}

export interface AuroraVisibilityRequest {
  lat: number;
  lng: number;
}

