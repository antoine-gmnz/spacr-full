import { Controller, Get, Query } from '@nestjs/common';
import { ESASpaceTelescopeImage } from '@prisma/client';
import { JwstService } from 'src/jwst/jwst.service';
import { PaginatedResponse } from 'src/shared/types/paginated-response';

@Controller('jwst')
export class JwstController {
  constructor(private readonly jwstService: JwstService) {}

  @Get()
  async getJwstImages(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ): Promise<PaginatedResponse<ESASpaceTelescopeImage[]>> {
    const pageNumber = isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);
    const limitNumber = isNaN(parseInt(limit, 10)) ? 10 : parseInt(limit, 10);

    return await this.jwstService.getImages(pageNumber, limitNumber, search);
  }

  @Get('search-by-title')
  async searchByTitle(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('title') title?: string,
  ): Promise<PaginatedResponse<ESASpaceTelescopeImage[]>> {
    const pageNumber = isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);
    const limitNumber = isNaN(parseInt(limit, 10)) ? 10 : parseInt(limit, 10);

    return await this.jwstService.searchByTitle(
      pageNumber,
      limitNumber,
      title || '',
    );
  }
}
