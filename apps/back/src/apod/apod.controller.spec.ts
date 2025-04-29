import { Test, TestingModule } from '@nestjs/testing';
import { ApodController } from './apod.controller';

describe('ApodController', () => {
  let controller: ApodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApodController],
    }).compile();

    controller = module.get<ApodController>(ApodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
