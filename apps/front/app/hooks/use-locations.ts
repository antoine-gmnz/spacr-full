import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import type { CreateUserLocationRequest, UpdateUserLocationRequest } from '@spacr/shared-types';

export function useLocations() {
  return useQuery({
    queryKey: ['user', 'locations'],
    queryFn: () => userApi.listLocations(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserLocationRequest) => userApi.createLocation(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'locations'] }),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserLocationRequest }) =>
      userApi.updateLocation(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'locations'] }),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.deleteLocation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'locations'] }),
  });
}
