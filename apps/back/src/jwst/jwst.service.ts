import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ESASpaceTelescopeImage, Prisma } from '@prisma/client';
import { equal } from 'assert';
import { PrismaService } from 'src/prisma.service';
import { PaginatedResponse } from 'src/shared/types/paginated-response';

@Injectable()
export class JwstService {
  constructor(private prismaService: PrismaService) {}

  async getImages(
    page: number,
    limit: number,
    search: string | undefined,
  ): Promise<PaginatedResponse<ESASpaceTelescopeImage[]>> {
    try {
      const skip = (page - 1) * limit;

      const where = search
        ? {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
            type: {
              equals: 'JAMES_WEBB',
            },
          }
        : {
            type: {
              equals: 'JAMES_WEBB',
            },
          };

      const [images, totalCount] = await Promise.all([
        this.prismaService.eSASpaceTelescopeImage.findMany({
          skip: skip,
          take: limit,
          where: where,
        }),
        this.prismaService.eSASpaceTelescopeImage.count({
          where: where,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response: PaginatedResponse<ESASpaceTelescopeImage[]> = {
        data: images,
        totalCount: totalCount,
        totalPages: totalPages,
        currentPage: page,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      };

      return response;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch JWST images',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async searchByTitle(
    page: number,
    limit: number,
    title: string,
  ): Promise<PaginatedResponse<ESASpaceTelescopeImage[]>> {
    try {
      const skip = (page - 1) * limit;

      const where = {
        title: {
          contains: title,
          mode: Prisma.QueryMode.insensitive,
        },
      };

      const [images, totalCount] = await Promise.all([
        this.prismaService.eSASpaceTelescopeImage.findMany({
          skip: skip,
          take: limit,
          where: where,
        }),
        this.prismaService.eSASpaceTelescopeImage.count({
          where: where,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response: PaginatedResponse<ESASpaceTelescopeImage[]> = {
        data: images,
        totalCount: totalCount,
        totalPages: totalPages,
        currentPage: page,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      };

      return response;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to search JWST images',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
