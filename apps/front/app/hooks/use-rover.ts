import { useQuery } from '@tanstack/react-query';
import { roverApi, RoverImagesParams } from '../api/rover';

export function useRoverImages(params: RoverImagesParams) {
  return useQuery({
    queryKey: ['rover', 'images', params],
    queryFn: () => roverApi.getRoverImages(params),
    enabled: !!params.rover, // Only run the query if rover is provided
  });
}