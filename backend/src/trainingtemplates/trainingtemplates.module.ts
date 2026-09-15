import { Module } from '@nestjs/common';
import { TrainingtemplatesService } from './trainingtemplates.service';
import { TrainingtemplatesController } from './trainingtemplates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TrainingTemplate,
  TrainingTemplateSchema,
} from './schemas/trainingtemplates.schema';
import { AgentToolsModule } from 'src/agent-tools/agent-tools.module';
import { OllamaModule } from 'src/ollama/ollama.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingTemplate.name, schema: TrainingTemplateSchema },
    ]),
    AgentToolsModule,
    OllamaModule,
  ],
  providers: [TrainingtemplatesService],
  controllers: [TrainingtemplatesController],
})
export class TrainingtemplatesModule {}
