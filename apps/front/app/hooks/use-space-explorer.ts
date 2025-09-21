import { useQuery } from '@tanstack/react-query';
import { spaceExplorerApi } from '../api/space-explorer';

export function useSpaceExplorerPositions() {
  return useQuery({
    queryKey: ['space-explorer', 'positions'],
    queryFn: () => spaceExplorerApi.getPositions(),
  });
}
