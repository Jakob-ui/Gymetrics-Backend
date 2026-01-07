import { Test, TestingModule } from '@nestjs/testing';
import { TrainingtemplatesController } from './trainingtemplates.controller';

describe('TrainingtemplatesController', () => {
  let controller: TrainingtemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingtemplatesController],
    }).compile();

    controller = module.get<TrainingtemplatesController>(TrainingtemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
