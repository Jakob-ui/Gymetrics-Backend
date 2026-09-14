import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { AgentToolsModule } from 'src/agent-tools/agent-tools.module';

@Module({
  providers: [OllamaService],
  imports: [AgentToolsModule],
  exports: [OllamaService],
})
export class OllamaModule {}
