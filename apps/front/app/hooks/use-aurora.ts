import { useQuery } from '@tanstack/react-query';
import { auroraApi } from '../api/aurora';

/**
 * Hook to fetch aurora forecast data
 */
export function useAuroraData() {
  return useQuery({
    queryKey: ['aurora'],
    queryFn: () => auroraApi.getAuroraData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

/**
 * Hook to check aurora visibility for a location
 */
export function useAuroraVisibility(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ['aurora-visibility', lat, lng],
    queryFn: () => {
      if (lat === null || lng === null) {
        throw new Error('Coordinates required');
      }
      return auroraApi.getVisibility(lat, lng);
    },
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000,
  });
}
