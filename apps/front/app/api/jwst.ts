import type { PaginatedResponse } from '../types/shared';
import type { SpaceTelescopeImage } from '../types/jwst';
import { http } from '../lib/http';

export interface JwstImagesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface JwstSearchParams {
  page?: number;
  limit?: number;
  title: string;
}

export const jwstApi = {
  getJwstImages: async ({ page = 1, limit = 10, search }: JwstImagesParams = {}): Promise<PaginatedResponse<SpaceTelescopeImage[]>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) {
      params.append('search', search);
    }

    return await http.get<PaginatedResponse<SpaceTelescopeImage[]>>(`/jwst?${params.toString()}`);
  },

  searchJwstByTitle: async ({ page = 1, limit = 10, title }: JwstSearchParams): Promise<PaginatedResponse<SpaceTelescopeImage[]>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('title', title);

    return await http.get<PaginatedResponse<SpaceTelescopeImage[]>>(`/jwst/search-by-title?${params.toString()}`);
  },
};
