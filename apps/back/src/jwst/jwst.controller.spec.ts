import { Test, TestingModule } from '@nestjs/testing';
import { JwstController } from './jwst.controller';

describe('JwstController', () => {
  let controller: JwstController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JwstController],
    }).compile();

    controller = module.get<JwstController>(JwstController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
