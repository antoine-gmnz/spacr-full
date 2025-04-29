import { useQuery } from '@tanstack/react-query';
import { tleApi } from '../api/tle';

export function useTleData() {
  return useQuery({
    queryKey: ['tle'],
    queryFn: () => tleApi.getTleData(),
  });
}