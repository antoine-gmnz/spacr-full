import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TleResponseDto } from './dto/tle-response.dto';

@Injectable()
export class TleService {
  // This is a simulation of TLE data since we don't have access to a real TLE API
  // In a real application, you would fetch this from a TLE data provider
  async getTleData(): Promise<TleResponseDto> {
    try {
      // Sample TLE data for demonstration purposes
      return {
        member: [
          {
            name: 'ISS (ZARYA)',
            satelliteId: '25544',
            line1: '1 25544U 98067A   24064.84628919  .00012872  00000+0  23082-3 0  9993',
            line2: '2 25544  51.6401 184.3215 0004810  99.5739 349.0925 15.50301993438542',
          },
          {
            name: 'HUBBLE SPACE TELESCOPE',
            satelliteId: '20580',
            line1: '1 20580U 90037B   24064.78141975  .00001047  00000+0  53313-4 0  9995',
            line2: '2 20580  28.4702 287.3756 0002681 259.3913 100.6848 15.10354375181432',
          },
          {
            name: 'JWST (JAMES WEBB)',
            satelliteId: '50463',
            line1: '1 50463U 21130A   24059.47872685 -.00000208  00000-0  00000+0 0  9993',
            line2: '2 50463   0.6292 338.1858 0021910 162.5015 220.9110  0.01497191   816',
          },
          {
            name: 'STARLINK-1007',
            satelliteId: '44713',
            line1: '1 44713U 19074A   24064.85416666  .00006745  00000+0  44092-3 0  9997',
            line2: '2 44713  53.0541 170.9203 0001253  82.1240 277.9881 15.06422246237583',
          },
          {
            name: 'NOAA 19',
            satelliteId: '33591',
            line1: '1 33591U 09005A   24064.88271605  .00000126  00000+0  91601-4 0  9996',
            line2: '2 33591  99.1753 144.2292 0013676 352.3322   7.7665 14.12571938778289',
          },
        ],
      };

      // In a real implementation, you would fetch from a TLE provider
      // const response = await fetch('https://tle-provider.com/api/tle');
      // return await response.json() as TleResponseDto;
    } catch (error) {
      console.error('Error fetching TLE data:', error);
      throw new HttpException(
        'Failed to fetch TLE data',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}