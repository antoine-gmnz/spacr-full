import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JWSTImages, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PaginatedResponse } from 'src/shared/types/paginated-response';

@Injectable()
export class JwstService {
  constructor(private prismaService: PrismaService) {}

  async getImages(
    page: number,
    limit: number,
    search: string | undefined,
  ): Promise<PaginatedResponse<JWSTImages[]>> {
    try {
      const skip = (page - 1) * limit;

      const where = search
        ? {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : undefined;

      const [images, totalCount] = await Promise.all([
        this.prismaService.jWSTImages.findMany({
          skip: skip,
          take: limit,
          where: where,
        }),
        this.prismaService.jWSTImages.count({
          where: where,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response: PaginatedResponse<JWSTImages[]> = {
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
  ): Promise<PaginatedResponse<JWSTImages[]>> {
    try {
      const skip = (page - 1) * limit;

      const where = {
        title: {
          contains: title,
          mode: Prisma.QueryMode.insensitive,
        },
      };

      const [images, totalCount] = await Promise.all([
        this.prismaService.jWSTImages.findMany({
          skip: skip,
          take: limit,
          where: where,
        }),
        this.prismaService.jWSTImages.count({
          where: where,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const response: PaginatedResponse<JWSTImages[]> = {
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
