import { Injectable } from '@nestjs/common';
import { TrainingService } from '../training/training.service';
import { StudiosService } from 'src/studios/studios.service';
import { AgentToolResponseDto } from './dtos/Response/agent-tools.response.dto';

type ToolCallArgs = Record<string, unknown>;

@Injectable()
export class AgentToolsService {
  constructor(
    private readonly trainingService: TrainingService,
    private readonly studioService: StudiosService,
  ) {}

  getToolSchemas() {
    return [
      {
        type: 'function',
        function: {
          name: 'getRecentTrainings',
          description: "Fetch the user's most recently completed trainings",
          parameters: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'max number of trainings to return',
              },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'getEquipment',
          description:
            "Fetch the equipment available at the user's active studio",
          parameters: { type: 'object', properties: {} },
        },
      },
    ];
  }

  async executeTool(
    userId: string,
    studio: string,
    name: string,
    args: ToolCallArgs,
  ): Promise<AgentToolResponseDto> {
    try {
      switch (name) {
        case 'getRecentTrainings': {
          const limit = (args.limit as number) ?? 10;
          const now = new Date();
          const trainings = await this.trainingService.findTrainingsofMonth(
            userId,
            String(now.getFullYear()),
            String(now.getMonth() + 1),
          );
          return AgentToolResponseDto.ok(trainings.slice(0, limit));
        }
        case 'getEquipment': {
          const equipment =
            await this.studioService.getEquipmentofStudio(studio);
          return AgentToolResponseDto.ok(equipment);
        }
        default:
          return AgentToolResponseDto.fail(`Unknown tool: ${name}`);
      }
    } catch (err) {
      return AgentToolResponseDto.fail(
        err instanceof Error ? err.message : 'Tool failed',
      );
    }
  }
}
