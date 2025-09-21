import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { roverApi, type RoverImagesParams } from '../api/rover';
import type { GetRoversResponseDTO, PaginatedResponse } from '@spacr/shared-types/dto';
import type { MarsRoverPhotoDto } from '@spacr/shared-types';

export function useRoverImages(params: RoverImagesParams) {
  return useQuery({
    queryKey: ['rover', 'images', params],
    queryFn: () => roverApi.getRoverImages(params),
    enabled: !!params.rover, // Only run the query if rover is provided
  });
}

export function useSearchRoverImages(params: RoverImagesParams & { page?: number; limit?: number }): UseQueryResult<PaginatedResponse<MarsRoverPhotoDto>> {
  return useQuery<PaginatedResponse<MarsRoverPhotoDto>>({
    queryKey: ['rover', 'images', 'search', params],
    queryFn: () => roverApi.searchRoverImages(params),
    enabled: !!params.rover && !!params.beginSol && !!params.endSol,
  });
}

export function useRovers() {
  return useQuery<GetRoversResponseDTO[]>({
    queryKey: ['rovers'],
    queryFn: () => roverApi.getRovers(),
  });
}
