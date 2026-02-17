import { useQuery } from '@tanstack/react-query';
import { issApi } from '../api/iss';

/**
 * Hook to fetch real-time ISS position
 * Auto-refreshes every 5 seconds for live tracking
 */
export function useISSPosition() {
  return useQuery({
    queryKey: ['iss-position'],
    queryFn: () => issApi.getPosition(),
    staleTime: 0, // Always consider stale for real-time updates
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
  });
}

/**
 * Hook to fetch current ISS crew members
 * Refreshes every 5 minutes (crew changes infrequently)
 */
export function useISSCrew() {
  return useQuery({
    queryKey: ['iss-crew'],
    queryFn: () => issApi.getCrew(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Hook to fetch upcoming ISS passes for a location
 */
export function useISSPasses(
  lat: number | null,
  lng: number | null,
  alt: number = 0,
  days: number = 10
) {
  return useQuery({
    queryKey: ['iss-passes', lat, lng, alt, days],
    queryFn: () => {
      if (lat === null || lng === null) {
        throw new Error('Coordinates required');
      }
      return issApi.getPasses(lat, lng, alt, days);
    },
    enabled: lat !== null && lng !== null,
    staleTime: 60 * 60 * 1000, // 1 hour (pass predictions don't change frequently)
  });
}

