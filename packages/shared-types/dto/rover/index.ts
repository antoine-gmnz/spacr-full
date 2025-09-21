import type { MarsRoverPhotoDto } from './roverImages';

export type { MarsRoverPhotoDto };

export type GetRoversResponseDTO = {
  id: number;
  name: string;
  landingDate: string;
  launchDate: string;
  status: string;
  maxSol: number;
  maxDate: string;
};