import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ApodResponseDto } from 'src/apod/dto/apod-response';

@Injectable()
export class ApodService {
  async getApod() {
    try {
      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`,
      );
      return (await response.json()) as ApodResponseDto;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch APOD data',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
