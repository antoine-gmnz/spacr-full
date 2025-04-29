import { useQuery } from '@tanstack/react-query';
import { apodApi } from '../api/apod';

export function useApod() {
  return useQuery({
    queryKey: ['apod'],
    queryFn: () => apodApi.getApod(),
  });
}