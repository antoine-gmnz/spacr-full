import { Test, TestingModule } from '@nestjs/testing';
import { ApodService } from './apod.service';

describe('ApodService', () => {
  let service: ApodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApodService],
    }).compile();

    service = module.get<ApodService>(ApodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
