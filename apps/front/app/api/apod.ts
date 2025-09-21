import { type APODResponse } from '../types/apod';
import { http } from '../lib/http';

export const apodApi = {
  getApod: async (): Promise<APODResponse> => {
    return await http.get<APODResponse>('/apod');
  },
};
