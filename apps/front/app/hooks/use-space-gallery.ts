import { useInfiniteQuery } from '@tanstack/react-query';
import { spaceGalleryApi, type SpaceGalleryParams } from '../api/space-gallery';
import type { GetSpaceTelescopeImagesResponseDTO } from '@spacr/shared-types/dto';

export function useSpaceGallery(params: Omit<SpaceGalleryParams, 'page'>) {
  return useInfiniteQuery<GetSpaceTelescopeImagesResponseDTO>({
    queryKey: ['space-gallery', params],
    queryFn: ({ pageParam = 1 }) => spaceGalleryApi.getImages({ ...params, page: pageParam as number }),
    getNextPageParam: lastPage => {
      if (lastPage.meta.currentPage < lastPage.meta.lastPage) {
        return lastPage.meta.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}
