import { Module } from '@nestjs/common';
import { AgentToolsService } from './agent-tools.service';
import { TrainingModule } from '../training/training.module';
import { StudiosModule } from 'src/studios/studios.module';

@Module({
  imports: [TrainingModule, StudiosModule],
  providers: [AgentToolsService],
  exports: [AgentToolsService],
})
export class AgentToolsModule {}
