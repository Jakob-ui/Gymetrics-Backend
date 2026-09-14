import { Test, TestingModule } from '@nestjs/testing';
import { AgentToolsModule } from './agent-tools.module';
import { AgentToolsService } from './agent-tools.service';
import { TrainingModule } from '../training/training.module';

describe('AgentToolsService', () => {
  let service: AgentToolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TrainingModule, AgentToolsModule],
    }).compile();

    service = module.get<AgentToolsService>(AgentToolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
