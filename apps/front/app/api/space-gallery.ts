import { http } from '../lib/http';
import type { GetSpaceTelescopeImagesResponseDTO } from '@spacr/shared-types/dto';

export interface SpaceGalleryParams {
  page?: number;
  limit?: number;
  search?: string;
  telescope?: 'HUBBLE' | 'JAMES_WEBB' | '' | null;
}

export const spaceGalleryApi = {
  getImages: async ({ page = 1, limit = 20, search = '', telescope = '' }: SpaceGalleryParams = {}): Promise<GetSpaceTelescopeImagesResponseDTO> => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    params.append('search', search);
    params.append('telescope', telescope ? telescope : '');
    return await http.get<GetSpaceTelescopeImagesResponseDTO>(`/esa-images/search?${params.toString()}`);
  },
};
