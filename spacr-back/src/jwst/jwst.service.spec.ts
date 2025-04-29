import { Test, TestingModule } from '@nestjs/testing';
import { JwstService } from './jwst.service';

describe('JwstService', () => {
  let service: JwstService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwstService],
    }).compile();

    service = module.get<JwstService>(JwstService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
