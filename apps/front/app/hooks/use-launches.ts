import { useQuery } from '@tanstack/react-query';
import { launchesApi, LaunchSearchParams } from '../api/launches';

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