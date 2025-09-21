import { useQuery } from '@tanstack/react-query';
import { spaceGalleryApi, type SpaceGalleryParams } from '../api/space-gallery';
import type { PaginatedResponse } from '@spacr/shared-types/dto';
import type { SpaceTelescopeImage } from '@/types/jwst';

export function useSpaceGallery(params: SpaceGalleryParams) {
  return useQuery<PaginatedResponse<SpaceTelescopeImage>>({
    queryKey: ['space-gallery', params],
    queryFn: () => spaceGalleryApi.getImages(params),
  });
}
