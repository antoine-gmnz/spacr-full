import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { launchesApi, type LaunchSearchParams } from '../api/launches';
import type { LaunchDataResponse } from '@spacr/shared-types';

export function useLaunches() {
  return useQuery({
    queryKey: ['launches'],
    queryFn: () => launchesApi.getLaunches(),
  });
}

export function useSearchLaunches(params: LaunchSearchParams = {}) {
  return useQuery({
    queryKey: ['launches', 'search', params],
    queryFn: () => launchesApi.searchLaunches(params),
  });
}

export function useUpcomingLaunches(limit: number = 1) {
  return useQuery({
    queryKey: ['launches', 'upcoming', limit],
    queryFn: () => launchesApi.getUpcomingLaunches(limit),
  });
}

export interface InfiniteLaunchParams {
  search?: string;
  year?: string;
  limit?: number;
}

export function useInfiniteLaunches({ search, year, limit = 12 }: InfiniteLaunchParams = {}) {
  return useInfiniteQuery<LaunchDataResponse, Error>({
    queryKey: ['launches', 'infinite', { search, year, limit }],
    queryFn: async ({ pageParam = 0 }) => {
      return launchesApi.searchLaunches({
        search,
        year,
        limit,
        offset: pageParam as number,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Calculate current total loaded
      const currentOffset = allPages.length * limit;
      
      // If we have more items to load
      if (lastPage.next && currentOffset < lastPage.count) {
        return currentOffset;
      }
      
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
