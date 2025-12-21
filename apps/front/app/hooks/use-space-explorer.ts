import { useQuery } from '@tanstack/react-query';
import { spaceExplorerApi } from '../api/space-explorer';
import type { BodyName } from '@/components/spaceExplorer/types';

/**
 * Hook to fetch all planetary positions
 * @param date Optional Date object to get positions at a specific time
 * @param enabled Whether the query should run
 * @param refetchInterval Auto-refresh interval in ms (default: 0 = disabled)
 */
export function useSpaceExplorerPositions(
  date?: Date,
  enabled: boolean = true,
  refetchInterval: number = 0
) {
  const dateString = date?.toISOString();
  
  return useQuery({
    queryKey: ['space-explorer', 'positions', dateString],
    queryFn: () => spaceExplorerApi.getPositions(dateString),
    enabled,
    refetchInterval: refetchInterval > 0 ? refetchInterval : false,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch a single body's position
 * @param body The celestial body name
 * @param date Optional Date object
 * @param enabled Whether the query should run
 */
export function useSpaceExplorerBody(
  body: BodyName,
  date?: Date,
  enabled: boolean = true
) {
  const dateString = date?.toISOString();
  
  return useQuery({
    queryKey: ['space-explorer', 'body', body, dateString],
    queryFn: () => spaceExplorerApi.getBody(body, dateString),
    enabled,
    staleTime: 60000,
  });
}
