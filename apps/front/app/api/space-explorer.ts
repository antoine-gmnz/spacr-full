import { http } from '../lib/http';
import type { PlanetPosition, BodyName, SpaceExplorerPositionsResponse } from '@/components/spaceExplorer/types';

export interface SpaceExplorerBodyResponse {
  success: boolean;
  data: PlanetPosition;
}

export const spaceExplorerApi = {
  /**
   * Get all planetary positions
   * @param date Optional ISO date string to get positions at a specific time
   */
  getPositions: async (date?: string): Promise<SpaceExplorerPositionsResponse> => {
    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    return await http.get<SpaceExplorerPositionsResponse>(`/space-explorer/positions${params}`);
  },

  /**
   * Get position for a single body
   * @param body The celestial body name
   * @param date Optional ISO date string
   */
  getBody: async (body: BodyName, date?: string): Promise<SpaceExplorerBodyResponse> => {
    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    return await http.get<SpaceExplorerBodyResponse>(`/space-explorer/body/${body}${params}`);
  },
};
