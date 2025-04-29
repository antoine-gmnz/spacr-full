import { type APODResponse } from "../types/apod";

const API_URL = "http://localhost:3000";

export const apodApi = {
  getApod: async (): Promise<APODResponse> => {
    const response = await fetch(`${API_URL}/apod`);

    if (!response.ok) {
      throw new Error(`Failed to fetch APOD: ${response.status}`);
    }

    return await response.json();
  },
};
