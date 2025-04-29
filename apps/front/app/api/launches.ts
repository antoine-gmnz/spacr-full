import { LaunchDataResponse } from "../types/launch-data";

const API_URL = "http://localhost:3000";

export interface LaunchSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
  year?: string;
}

export const launchesApi = {
  getLaunches: async (): Promise<LaunchDataResponse> => {
    const response = await fetch(`${API_URL}/launches`);

    if (!response.ok) {
      throw new Error(`Failed to fetch launches: ${response.status}`);
    }

    return await response.json();
  },

  searchLaunches: async ({
    search,
    limit = 10,
    offset = 0,
    year,
  }: LaunchSearchParams = {}): Promise<LaunchDataResponse> => {
    const params = new URLSearchParams();

    if (search) {
      params.append("search", search);
    }

    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    if (year) {
      params.append("year", year);
    }

    const response = await fetch(
      `${API_URL}/launches/search?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search launches: ${response.status}`);
    }

    return await response.json();
  },
};
