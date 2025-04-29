import { Controller, Get, Query } from '@nestjs/common';
import { LaunchesService } from './launches.service';
import { LaunchDataResponseDto } from './dto/launch-response.dto';

@Controller('launches')
export class LaunchesController {
  constructor(private readonly launchesService: LaunchesService) {}

  @Get()
  async getLaunches(): Promise<LaunchDataResponseDto> {
    return await this.launchesService.getLaunches();
  }

  @Get('search')
  async searchLaunches(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('year') year?: string,
  ): Promise<LaunchDataResponseDto> {
    const limitValue = !limit || isNaN(parseInt(limit)) ? 7 : parseInt(limit);

    const offsetValue =
      !offset || isNaN(parseInt(offset)) ? 0 : parseInt(offset);

    return await this.launchesService.searchLaunches(
      search,
      limitValue,
      offsetValue,
      year,
    );
  }
}
