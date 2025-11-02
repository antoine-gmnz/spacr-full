import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { roverApi, type RoverImagesParams } from '../api/rover';
import type { GetRoversResponseDTO, GetRoverImagesResponseDTO, PaginatedResponse } from '@spacr/shared-types';

export function useRoverImages(params: RoverImagesParams) {
  return useQuery({
    queryKey: ['rover', 'images', params],
    queryFn: () => roverApi.getRoverImages(params),
    enabled: !!params.rover, // Only run the query if rover is provided
  });
}

export function useSearchRoverImages(params: RoverImagesParams & { page?: number; limit?: number }): UseQueryResult<PaginatedResponse<GetRoverImagesResponseDTO>> {
  return useQuery<PaginatedResponse<GetRoverImagesResponseDTO>>({
    queryKey: ['rover', 'images', 'search', params],
    queryFn: () => roverApi.searchRoverImages(params),
    enabled: !!params.rover && !!params.beginSol && !!params.endSol,
  });
}

export function useLatestRoverImages() {
  return useQuery<PaginatedResponse<GetRoverImagesResponseDTO>>({
    queryKey: ['rover', 'images', 'latest'],
    queryFn: () => roverApi.getLatestRoverImages(),
  });
}

export function useRovers() {
  return useQuery<GetRoversResponseDTO>({
    queryKey: ['rovers'],
    queryFn: () => roverApi.getRovers(),
  });
}
