import { Controller, Get } from '@nestjs/common';
import { TleService } from './tle.service';
import { TleResponseDto } from './dto/tle-response.dto';

@Controller('tle')
export class TleController {
  constructor(private readonly tleService: TleService) {}

  @Get('gettledata')
  async getTleData(): Promise<TleResponseDto> {
    return await this.tleService.getTleData();
  }
}