import { http } from '../lib/http';
import type { ObjectPositionDTO } from '@/components/spaceExplorer/SpaceScene';

export interface SpaceExplorerPositionsResponse {
  success: boolean;
  data: {
    date: string;
    positions: ObjectPositionDTO[];
  };
}

export const spaceExplorerApi = {
  getPositions: async (): Promise<SpaceExplorerPositionsResponse> => {
    return await http.get<SpaceExplorerPositionsResponse>('/space-explorer/positions');
  },
};
