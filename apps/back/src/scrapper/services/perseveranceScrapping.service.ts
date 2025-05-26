import { Injectable, Logger } from '@nestjs/common';
import { RoverImage } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

interface APIReturn {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
}

@Injectable()
export class PerseveranceScrappingService {
  protected readonly logger = new Logger(this.constructor.name);
  constructor(protected readonly prismaService: PrismaService) {}

  async initScrapping(): Promise<boolean> {
    try {
      const endSol = 4550;
      const imageList: Omit<RoverImage, 'id'>[] = [];
      for (let sol = 0; sol <= endSol; sol++) {
        const result = await fetch(
          `https://mars-photos.herokuapp.com/api/v1/rovers/Opportunity/photos?sol=${sol}`,
        );
        const data = (await result.json()) as { photos: APIReturn[] };

        for (const photo of data.photos) {
          if (photo.img_src) {
            this.logger.log(
              `Extracted data for Sol ${photo.sol}: URL: ${photo.img_src}, Title: ${photo.camera.full_name}, Camera: ${photo.camera.name}`,
            );

            imageList.push({
              img_src: photo.img_src,
              title: photo.camera.full_name,
              sol: photo.sol,
              camera: photo.camera.name,
              roverId: 2,
              credits: 'NASA/JPL-Caltech',
            });
          }
        }
      }
      await this.saveData(imageList);
    } catch (error: any) {
      this.logger.error('Error during scraping', error || error);
      return false;
    }
    return false;
  }

  async saveData(imageData: Omit<RoverImage, 'id'>[]) {
    try {
      await this.prismaService.roverImage.createMany({
        data: imageData,
        skipDuplicates: true,
      });
      this.logger.log(
        `New Perseverance images saved: ${imageData
          .map((img) => img.title || 'Untitled')
          .join(', ')}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to save image data`, error || error);
    }
  }
}
