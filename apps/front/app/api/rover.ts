import { MarsRoverResponse } from "../types/rover";

const API_URL = "http://localhost:3000";

export interface RoverImagesParams {
  rover: string;
  camera?: string;
  beginSol?: string;
  endSol?: string;
}

export const roverApi = {
  getRoverImages: async ({
    rover,
    camera,
    beginSol,
    endSol,
  }: RoverImagesParams): Promise<MarsRoverResponse> => {
    const params = new URLSearchParams();
    params.append("rover", rover);

    if (camera) {
      params.append("camera", camera);
    }

    if (beginSol) {
      params.append("begin_sol", beginSol);
    }

    if (endSol) {
      params.append("end_sol", endSol);
    }

    const response = await fetch(`${API_URL}/rover?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch rover images: ${response.status}`);
    }

    return await response.json();
  },
};
