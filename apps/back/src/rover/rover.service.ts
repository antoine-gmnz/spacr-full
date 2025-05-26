import { PaginatedResponse } from 'src/shared/types/paginated-response';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import {
  MarsRoverResponseDto,
  MarsRoverPhotoDto,
  RoverDto,
} from './dto/rover-response.dto';

@Injectable()
export class RoverService {
  private readonly logger = new Logger(RoverService.name);
  constructor(private prismaService: PrismaService) {}

  async getRoverImages(
    rover: string,
    camera: string,
    beginSol: string,
    endSol: string,
    page: string = '1',
    limit: string = '10',
  ): Promise<PaginatedResponse<MarsRoverResponseDto>> {
    try {
      // Validate inputs
      if (!rover) {
        throw new HttpException(
          'Rover name is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Convert pagination parameters
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      // Convert the sol range
      const beginSolNumber = beginSol ? parseInt(beginSol) : null;
      const endSolNumber = endSol ? parseInt(endSol) : null;

      // Validate sol range
      if (beginSolNumber !== null && endSolNumber !== null) {
        if (beginSolNumber > endSolNumber) {
          throw new HttpException(
            'Begin sol must be less than or equal to end sol',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (!beginSolNumber || !endSolNumber) {
        throw new HttpException(
          'Both begin sol and end sol are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Build query filters
      const whereClause: Prisma.RoverImageWhereInput = {
        Rover: {
          name: {
            equals: rover,
            mode: 'insensitive',
          },
        },
        sol: {
          gte: beginSolNumber,
          lte: endSolNumber,
        },
      };

      // Add camera filter if provided
      if (camera) {
        whereClause.camera = {
          equals: camera,
          mode: 'insensitive',
        };
      }

      // Fetch rover images with pagination
      const [roverImages, totalCount] = await Promise.all([
        this.prismaService.roverImage.findMany({
          where: whereClause,
          include: {
            Rover: true,
          },
          skip: skip,
          take: limitNumber,
          orderBy: {
            sol: 'asc',
          },
        }),
        this.prismaService.roverImage.count({
          where: whereClause,
        }),
      ]);

      // Map database results to DTO format
      const photos: MarsRoverPhotoDto[] = roverImages.map((image) => ({
        id: image.id,
        sol: image.sol,
        camera: image.camera,
        img_src: image.img_src,
        credits: image.credits,
        earth_date: this.calculateEarthDate(
          image.Rover.landing_date,
          image.sol,
        ),
        rover: {
          id: image.Rover.id,
          name: image.Rover.name,
          landing_date: image.Rover.landing_date.toISOString().split('T')[0],
          launch_date: image.Rover.launch_date.toISOString().split('T')[0],
          status: image.Rover.status,
        } as RoverDto,
      }));

      const response: PaginatedResponse<MarsRoverResponseDto> = {
        data: { photos: photos },
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / limitNumber),
        currentPage: pageNumber,
        hasNextPage: pageNumber * limitNumber < totalCount,
        hasPrevPage: pageNumber > 1,
        nextPage: pageNumber * limitNumber < totalCount ? pageNumber + 1 : null,
        prevPage: pageNumber > 1 ? pageNumber - 1 : null,
      };

      return response;
    } catch (error) {
      console.error('Error fetching rover images:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch rover images',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  private getCameraFullName(camera: string): string {
    const cameraMap: { [key: string]: string } = {
      FHAZ: 'Front Hazard Avoidance Camera',
      RHAZ: 'Rear Hazard Avoidance Camera',
      MAST: 'Mast Camera',
      CHEMCAM: 'Chemistry and Camera Complex',
      MAHLI: 'Mars Hand Lens Imager',
      MARDI: 'Mars Descent Imager',
      NAVCAM: 'Navigation Camera',
      PANCAM: 'Panoramic Camera',
      MINITES: 'Miniature Thermal Emission Spectrometer (Mini-TES)',
    };

    return cameraMap[camera.toUpperCase()] || camera;
  }

  private calculateEarthDate(landingDate: Date, sol: number): string {
    // Mars sol is approximately 24 hours, 39 minutes, and 35 seconds
    const solInMilliseconds = 24 * 60 * 60 * 1000 + 39 * 60 * 1000 + 35 * 1000;
    const earthDate = new Date(landingDate.getTime() + sol * solInMilliseconds);
    return earthDate.toISOString().split('T')[0];
  }
}
