import { PaginatedResponse } from "../types/shared";
import { JWSTImage } from "../types/jwst";

const API_URL = "http://localhost:3000";

export interface JwstImagesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface JwstSearchParams {
  page?: number;
  limit?: number;
  title: string;
}

export const jwstApi = {
  getJwstImages: async ({
    page = 1,
    limit = 10,
    search,
  }: JwstImagesParams = {}): Promise<PaginatedResponse<JWSTImage[]>> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (search) {
      params.append("search", search);
    }

    const response = await fetch(`${API_URL}/jwst?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch JWST images: ${response.status}`);
    }

    return await response.json();
  },

  searchJwstByTitle: async ({
    page = 1,
    limit = 10,
    title,
  }: JwstSearchParams): Promise<PaginatedResponse<JWSTImage[]>> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    params.append("title", title);

    const response = await fetch(
      `${API_URL}/jwst/search-by-title?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search JWST images: ${response.status}`);
    }

    return await response.json();
  },
};
