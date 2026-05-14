import { http } from '@/lib/http';
import type {
  CreateUserLocationRequest,
  UpdateUserLocationRequest,
  UserLocationDto,
} from '@spacr/shared-types';

export const userApi = {
  listLocations: (): Promise<{ locations: UserLocationDto[] }> =>
    http.get<{ locations: UserLocationDto[] }>('/user/locations'),

  createLocation: (data: CreateUserLocationRequest): Promise<{ location: UserLocationDto }> =>
    http.post<{ location: UserLocationDto }, CreateUserLocationRequest>('/user/locations', data),

  updateLocation: (
    id: string,
    data: UpdateUserLocationRequest
  ): Promise<{ location: UserLocationDto }> =>
    http.patch<{ location: UserLocationDto }, UpdateUserLocationRequest>(
      `/user/locations/${id}`,
      data
    ),

  deleteLocation: (id: string): Promise<void> =>
    http.delete<void>(`/user/locations/${id}`),
};
