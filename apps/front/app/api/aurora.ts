import type { AuroraData, AuroraVisibility } from '@spacr/shared-types';
import { http } from '../lib/http';

export const auroraApi = {
  /**
   * Get current aurora forecast data
   */
  getAuroraData: async (): Promise<AuroraData> => {
    return await http.get<AuroraData>('/aurora');
  },

  /**
   * Check aurora visibility for a specific location
   */
  getVisibility: async (lat: number, lng: number): Promise<AuroraVisibility> => {
    return await http.get<AuroraVisibility>(`/aurora/visibility?lat=${lat}&lng=${lng}`);
  },
};
