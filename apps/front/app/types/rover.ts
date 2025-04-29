export interface RoverCamera {
  id: number;
  name: string;
  rover_id: number;
  full_name: string;
}

export interface Rover {
  id: number;
  name: string;
  landing_date: string;
  launch_date: string;
  status: string;
}

export interface MarsRoverPhoto {
  id: number;
  sol: number;
  camera: RoverCamera;
  img_src: string;
  earth_date: string;
  rover: Rover;
}

export interface MarsRoverResponse {
  photos: MarsRoverPhoto[];
}

export type MarsRoverPhotosCameraNamesAbv =
  | "FHAZ"
  | "RHAZ"
  | "MAST"
  | "CHEMCAM"
  | "MAHLI"
  | "MARDI"
  | "NAVCAM"
  | "PANCAM"
  | "MINITES";

export enum MarsRoverPhotosCameraNames {
  "FAHZ" = "Front Hazard Avoidance Camera",
  "RHAZ" = "Rear Hazard Avoidance Camera",
  "MAST" = "Mast Camera",
  "CHEMCAM" = "Chemistry and Camera Complex",
  "MAHLI" = "Mars Hand Lens Imager",
  "MARDI" = "Mars Descent Imager",
  "NAVCAM" = "Navigation Camera",
  "PANCAM" = "Panoramic Camera",
  "MINITES" = "Miniature Thermal Emission Spectrometer (Mini-TES)",
}

export type MarsRoverNames = "curiosity" | "opportunity" | "spirit";

export const MappingRoverNamesAndCameras: Record<
  MarsRoverNames,
  MarsRoverPhotosCameraNamesAbv[]
> = {
  curiosity: ["FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHLI", "MARDI", "NAVCAM"],
  opportunity: ["FHAZ", "RHAZ", "MAHLI", "MARDI", "NAVCAM"],
  spirit: ["FHAZ", "RHAZ", "MAHLI", "MARDI", "NAVCAM"],
};

export const MarsRoverManifest: Record<
  string,
  Omit<RoverManifest, "cameras">
> = {
  curiosity: {
    id: 5,
    landing_date: "2012-08-06",
    launch_date: "2011-11-26",
    max_date: "2024-02-19",
    max_sol: 4102,
    name: "Curiosity",
    status: "active",
    total_photos: 695670,
  },
  opportunity: {
    id: 6,
    name: "Opportunity",
    landing_date: "2004-01-25",
    launch_date: "2003-07-07",
    status: "complete",
    max_sol: 5111,
    max_date: "2018-06-11",
    total_photos: 198439,
  },
  spirit: {
    id: 7,
    name: "Spirit",
    landing_date: "2004-01-04",
    launch_date: "2003-06-10",
    status: "complete",
    max_sol: 2208,
    max_date: "2010-03-21",
    total_photos: 124550,
  },
};

export interface MarsRoverPhotoResponse {
  photos: MarsRoverResponse[];
}

export interface MarsRoverResponse {
  id: string;
  sol: number;
  camera: RoverCameraDetails;
  img_src: string;
  earth_date: string;
  rover: RoverManifest;
}

export interface RoverManifest {
  id: number;
  name: string;
  landing_date: string;
  launch_date: string;
  status: string;
  max_sol: number;
  max_date: string;
  total_photos: number;
  cameras: RoverCamera[];
}

export interface RoverCamera {
  name: string;
  full_name: string;
}

export interface RoverCameraDetails {
  id: number;
  name: string;
  rover_id: number;
  full_name: string;
}
