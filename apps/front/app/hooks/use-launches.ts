import { useQuery } from '@tanstack/react-query';
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
