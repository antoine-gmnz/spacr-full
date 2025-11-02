import { type MarsRoverResponse } from '../types/rover';
import { http } from '../lib/http';
import type { GetRoversResponseDTO, GetRoverImagesResponseDTO, PaginatedResponse } from '@spacr/shared-types/dto';

export interface RoverImagesParams {
  rover: number;
  camera?: number;
  beginSol?: string;
  endSol?: string;
}

export const roverApi = {
  getRovers: async (): Promise<GetRoversResponseDTO> => {
    try {
      return await http.get<GetRoversResponseDTO>('/rovers');
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getLatestRoverImages: async (): Promise<PaginatedResponse<GetRoverImagesResponseDTO>> => {
    try {
      return await http.get<PaginatedResponse<GetRoverImagesResponseDTO>>('/rover-image/latest');
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getRoverImages: async ({ rover, camera, beginSol, endSol }: RoverImagesParams): Promise<MarsRoverResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('rover', rover.toString());

      if (camera) {
        params.append('camera', camera.toString());
      }

      if (beginSol) {
        params.append('begin_sol', beginSol);
      }

      if (endSol) {
        params.append('end_sol', endSol);
      }

      return await http.get<MarsRoverResponse>(`/rover?${params.toString()}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  searchRoverImages: async ({
    rover,
    camera,
    beginSol,
    endSol,
    page = 1,
    limit = 20,
  }: RoverImagesParams & { page?: number; limit?: number }): Promise<PaginatedResponse<GetRoverImagesResponseDTO>> => {
    const params = new URLSearchParams();
    params.append('rover', rover.toString());
    if (camera) params.append('camera', camera.toString());
    if (beginSol) params.append('begin_sol', beginSol);
    if (endSol) params.append('end_sol', endSol);
    params.append('page', String(page));
    params.append('limit', String(limit));
    return await http.get(`/rover-image/search?${params.toString()}`);
  },
};
