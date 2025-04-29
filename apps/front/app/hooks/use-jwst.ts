import { useQuery } from '@tanstack/react-query';
import { jwstApi, JwstImagesParams, JwstSearchParams } from '../api/jwst';

export function useJwstImages(params: JwstImagesParams = {}) {
  return useQuery({
    queryKey: ['jwst', 'images', params],
    queryFn: () => jwstApi.getJwstImages(params),
  });
}

export function useJwstSearch(params: JwstSearchParams) {
  return useQuery({
    queryKey: ['jwst', 'search', params],
    queryFn: () => jwstApi.searchJwstByTitle(params),
    enabled: !!params.title, // Only run the query if title is provided
  });
}