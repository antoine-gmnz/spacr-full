import { Controller, Get, Query } from '@nestjs/common';
import { RoverService } from './rover.service';
import { MarsRoverResponseDto } from './dto/rover-response.dto';

@Controller('rover')
export class RoverController {
  constructor(private readonly roverService: RoverService) {}

  @Get()
  async getRoverImages(
    @Query('rover') rover: string,
    @Query('camera') camera: string,
    @Query('begin_sol') beginSol: string,
    @Query('end_sol') endSol: string,
  ): Promise<MarsRoverResponseDto> {
    return await this.roverService.getRoverImages(
      rover,
      camera,
      beginSol,
      endSol,
    );
  }
}
