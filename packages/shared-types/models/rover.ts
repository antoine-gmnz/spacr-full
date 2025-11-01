import { CameraModel } from './camera';
import { RoverImageModel } from './roverImage';

export type RoverModel = {
  id: number;
  name: string;
  landingDate: string;
  launchDate: string;
  status: string;
  maxSol: number;
  maxDate: string;
  cameras?: CameraModel[];
  roverImages?: RoverImageModel[];
};
