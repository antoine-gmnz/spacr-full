import { type MarsRoverResponse } from '../types/rover';
import { http } from '../lib/http';
import type { GetRoversResponseDTO, PaginatedResponse } from '@spacr/shared-types/dto';

export interface RoverImagesParams {
  rover: string;
  camera?: string;
  beginSol?: string;
  endSol?: string;
}

export const roverApi = {
  getRovers: async (): Promise<GetRoversResponseDTO[]> => {
    return await http.get<GetRoversResponseDTO[]>('/rovers');
  },
  getRoverImages: async ({ rover, camera, beginSol, endSol }: RoverImagesParams): Promise<MarsRoverResponse> => {
    const params = new URLSearchParams();
    params.append('rover', rover);

    if (camera) {
      params.append('camera', camera);
    }

    if (beginSol) {
      params.append('begin_sol', beginSol);
    }

    if (endSol) {
      params.append('end_sol', endSol);
    }

    return await http.get<MarsRoverResponse>(`/rover?${params.toString()}`);
  },
  searchRoverImages: async ({
    rover,
    camera,
    beginSol,
    endSol,
    page = 1,
    limit = 20,
  }: RoverImagesParams & { page?: number; limit?: number }): Promise<PaginatedResponse<MarsRoverResponse>> => {
    const params = new URLSearchParams();
    params.append('rover', rover);
    if (camera) params.append('camera', camera);
    if (beginSol) params.append('begin_sol', beginSol);
    if (endSol) params.append('end_sol', endSol);
    params.append('page', String(page));
    params.append('limit', String(limit));
    return await http.get(`/rover-images/search?${params.toString()}`);
  },
};
