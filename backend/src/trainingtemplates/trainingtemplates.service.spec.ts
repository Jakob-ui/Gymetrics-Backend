import { Test, TestingModule } from '@nestjs/testing';
import { TrainingtemplatesService } from './trainingtemplates.service';

describe('TrainingtemplatesService', () => {
  let service: TrainingtemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingtemplatesService],
    }).compile();

    service = module.get<TrainingtemplatesService>(TrainingtemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
