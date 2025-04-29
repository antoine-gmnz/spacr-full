import { TleResponse } from "../types/tle";

const API_URL = "http://localhost:3000";

export const tleApi = {
  getTleData: async (): Promise<TleResponse> => {
    const response = await fetch(`${API_URL}/tle/gettledata`);

    if (!response.ok) {
      throw new Error(`Failed to fetch TLE data: ${response.status}`);
    }

    return await response.json();
  },
};
