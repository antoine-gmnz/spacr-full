import { RoverModel } from './rover';
import { CameraModel } from './camera';

export type RoverImageModel = {
  id: number;
  sol: number;
  cameraId: number;
  imgSrc: string;
  thumbnailUrl: string;
  roverId: number;
  title: string;
  caption: string;
  credits: string;
  rover: RoverModel;
  camera: CameraModel;
};
