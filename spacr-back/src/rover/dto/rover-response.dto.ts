export class RoverCameraDto {
  id: number;
  name: string;
  rover_id: number;
  full_name: string;
}

export class RoverDto {
  id: number;
  name: string;
  landing_date: string;
  launch_date: string;
  status: string;
}

export class MarsRoverPhotoDto {
  id: number;
  sol: number;
  camera: RoverCameraDto;
  img_src: string;
  earth_date: string;
  rover: RoverDto;
}

export class MarsRoverResponseDto {
  photos: MarsRoverPhotoDto[];
}