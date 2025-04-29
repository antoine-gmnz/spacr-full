import { Controller, Get } from '@nestjs/common';
import { ApodService } from 'src/apod/apod.service';
import { ApodResponseDto } from 'src/apod/dto/apod-response';

@Controller('apod')
export class ApodController {
  constructor(private readonly apodService: ApodService) {}

  @Get()
  async getApodData(): Promise<ApodResponseDto> {
    return await this.apodService.getApod();
  }
}
