export interface MarsRoverPhotoDto {
  id: number;
  imgHash: string;
  sol: number;
  roverId: number;
  cameraCode: string;
  metadata: {
    title: string;
    credits: string;
    originalUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}
