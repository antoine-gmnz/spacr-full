import { http } from '../lib/http';
import type { LaunchDataResponse } from '@spacr/shared-types';

export interface LaunchSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
  year?: string;
}

export const launchesApi = {
  getLaunches: async (): Promise<LaunchDataResponse> => {
    return await http.get<LaunchDataResponse>('/launches');
  },

  getUpcomingLaunches: async (limit: number = 10): Promise<LaunchDataResponse> => {
    return await http.get<LaunchDataResponse>(`/launches/upcoming?limit=${limit}`);
  },

  searchLaunches: async ({ search, limit = 10, offset = 0, year }: LaunchSearchParams = {}): Promise<LaunchDataResponse> => {
    const params = new URLSearchParams();

    if (search) {
      params.append('search', search);
    }

    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    if (year) {
      params.append('year', year);
    }

    return await http.get<LaunchDataResponse>(`/launches/search?${params.toString()}`);
  },
};
