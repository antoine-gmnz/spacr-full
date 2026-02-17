import type { TleResponse } from '../types/tle';
import { http } from '../lib/http';

export const tleApi = {
  getTleData: async (): Promise<TleResponse> => {
    return await http.get<TleResponse>('/tle/gettledata');
  },
};
