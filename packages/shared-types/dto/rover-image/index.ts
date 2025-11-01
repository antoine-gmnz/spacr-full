import { PaginatedResponse } from '../..';
import { RoverImageModel } from '../../models/roverImage';

export type GetRoverImagesResponseDTO = PaginatedResponse<RoverImageModel>;
