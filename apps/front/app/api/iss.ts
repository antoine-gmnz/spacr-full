import type { ISSPosition, ISSCrewResponse, ISSPassesResponse } from '../types/iss';
import { http } from '../lib/http';

export const issApi = {
  /**
   * Get current ISS position
   */
  getPosition: async (): Promise<ISSPosition> => {
    return await http.get<ISSPosition>('/iss/position');
  },

  /**
   * Get current ISS crew members
   */
  getCrew: async (): Promise<ISSCrewResponse> => {
    return await http.get<ISSCrewResponse>('/iss/crew');
  },

  /**
   * Get upcoming ISS passes for a location
   */
  getPasses: async (lat: number, lng: number, alt: number = 0, days: number = 10): Promise<ISSPassesResponse> => {
    return await http.get<ISSPassesResponse>(`/iss/passes?lat=${lat}&lng=${lng}&alt=${alt}&days=${days}`);
  },
};
