import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LaunchDataResponseDto } from './dto/launch-response.dto';

@Injectable()
export class LaunchesService {
  private readonly baseUrl = 'https://lldev.thespacedevs.com/2.2.0';

  async getLaunches(): Promise<LaunchDataResponseDto> {
    try {
      const response = await fetch(
        `${this.baseUrl}/launch/upcoming/?mode=detailed`,
      );
      return (await response.json()) as LaunchDataResponseDto;
    } catch (error) {
      console.error('Error fetching launches:', error);
      throw new HttpException(
        'Failed to fetch launch data',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async searchLaunches(
    search: string | undefined,
    limit: number,
    offset: number,
    year?: string,
  ): Promise<LaunchDataResponseDto> {
    try {
      const params = new URLSearchParams();

      if (search) {
        params.append('search', search);
      }

      if (limit) {
        params.append('limit', limit.toString());
      }

      if (offset) {
        params.append('offset', offset.toString());
      }

      // Default to current year if not specified
      const yearFilter = year || '2025';
      params.append('net__year', yearFilter);

      const url = `${this.baseUrl}/launch/upcoming/?${params.toString()}&mode=detailed`;
      const response = await fetch(url);

      return (await response.json()) as LaunchDataResponseDto;
    } catch (error) {
      console.error('Error searching launches:', error);
      throw new HttpException(
        'Failed to search launch data',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
