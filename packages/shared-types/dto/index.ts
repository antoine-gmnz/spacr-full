export type { GetRoverImagesResponseDTO } from './rover-image';
export type { GetRoversResponseDTO } from './rover';
export type { GetCamerasResponseDTO } from './camera';
export type { GetSpaceTelescopeImagesResponseDTO } from './space-telescope-image';
export type { LaunchData, LaunchDataResponse } from './launch';
export type { AuroraPoint, AuroraData, AuroraVisibility, AuroraVisibilityRequest } from './aurora';

export type PaginatedData = {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
  firstPageUrl: string;
  lastPageUrl: string;
  nextPageUrl: string;
  previousPageUrl: string | null;
};

export type PaginatedResponse<T> = {
  meta: PaginatedData;
  data: T[];
};
