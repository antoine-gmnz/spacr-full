import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MarsRoverResponseDto } from './dto/rover-response.dto';

@Injectable()
export class RoverService {
  async getRoverImages(
    rover: string,
    camera: string,
    beginSol: string,
    endSol: string,
  ): Promise<MarsRoverResponseDto> {
    try {
      // Validate inputs
      if (!rover) {
        throw new HttpException(
          'Rover name is required',
          HttpStatus.BAD_REQUEST,
        );
      }

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

      const params = new URLSearchParams();
      if (!process.env.NASA_API_KEY) {
        throw new HttpException(
          'NASA API key is not set',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      params.append('api_key', process.env.NASA_API_KEY);

      if (camera) {
        params.append('camera', camera);
      }

      if (beginSolNumber !== null) {
        params.append('sol', beginSolNumber.toString());
      }

      // We're using the begin_sol for the API call since the NASA API doesn't support
      // a sol range. For a production app, we would need to make multiple calls
      // and aggregate the results for a real range.

      const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new HttpException(
          `NASA API responded with status: ${response.status}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      return (await response.json()) as MarsRoverResponseDto;
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
}
