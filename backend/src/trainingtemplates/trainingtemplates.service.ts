import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TemplateRequestDto } from './dtos/Request/template.request.dto';
import { TrainingTemplate } from './schemas/trainingtemplates.schema';
import { TemplateResponseDto } from './dtos/Response/template.response.dto';
import { TemplateOverviewResponseDto } from './dtos/Response/templateoverview.response.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AgentToolsService } from 'src/agent-tools/agent-tools.service';
import { OllamaService } from 'src/ollama/ollama.service';
import { OllamaMessage } from 'src/ollama/ollama.types';
import { GenerateTemplateRequestDto } from './dtos/Request/generateTemplate.request.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const templateJsonSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    plan: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          sets: { type: 'number' },
          reps: { type: 'number' },
          weight: { type: 'number' },
        },
        required: ['title', 'sets', 'reps', 'weight'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'plan'],
  additionalProperties: false,
};

@Injectable()
export class TrainingtemplatesService {
  constructor(
    @InjectModel(TrainingTemplate.name)
    private templateModel: Model<TrainingTemplate>,
    private agentToolsService: AgentToolsService,
    private ollama: OllamaService,
  ) {}

  async create(
    createDto: TemplateRequestDto,
    userId: string,
  ): Promise<TrainingTemplate> {
    try {
      const newTemplate = new this.templateModel({
        ...createDto,
        userId: new Types.ObjectId(userId),
      });
      return await newTemplate.save();
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateTemplateForUser(
    userId: string,
    reqDto: TemplateRequestDto,
    templateId: string,
  ): Promise<TemplateResponseDto> {
    try {
      const template = await this.templateModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(templateId),
          userId: new Types.ObjectId(userId),
        },
        { $set: { ...reqDto } },
        { new: true },
      );
      if (!template) {
        throw new NotFoundException('Template not found');
      }
      return TrainingTemplate.mapToDto(template);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async deleteTemplateForUser(userId: string, templateId: string) {
    try {
      const result = await this.templateModel.deleteOne({
        _id: new Types.ObjectId(templateId),
        userId: new Types.ObjectId(userId),
      });
      if (result.deletedCount === 0) {
        throw new NotFoundException('Template not found');
      }
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async findTemplateForUser(
    userId: string,
    templateId: string,
  ): Promise<TemplateResponseDto> {
    try {
      const template = await this.templateModel.findOne({
        _id: new Types.ObjectId(templateId),
        userId: new Types.ObjectId(userId),
      });
      if (!template) {
        throw new NotFoundException('Template not found');
      }
      return TrainingTemplate.mapToDto(template);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async findTemplatesForUser(
    userId: string,
    page: number,
    limit: number,
    asc: boolean,
    sortBy: string,
    search?: string,
  ): Promise<TemplateOverviewResponseDto[]> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (safePage - 1) * safeLimit;
    const allowedSortFields = {
      createdAt: '_createdAt',
      updatedAt: '_updatedAt',
      name: 'name',
    } as const;

    const sortField =
      allowedSortFields[sortBy as keyof typeof allowedSortFields] ??
      'createdAt';

    type TemplateListFilter = {
      userId: Types.ObjectId;
      $or?: Array<
        | { title: { $regex: string; $options: 'i' } }
        | { description: { $regex: string; $options: 'i' } }
      >;
    };

    const q = search?.trim();
    const filter: TemplateListFilter = {
      userId: new Types.ObjectId(userId),
      ...(q
        ? {
            $or: [
              { title: { $regex: q, $options: 'i' } },
              { description: { $regex: q, $options: 'i' } },
            ],
          }
        : {}),
    };

    try {
      const templates = await this.templateModel
        .find(filter)
        .sort({ [sortField]: asc ? 1 : -1 })
        .skip(skip)
        .limit(safeLimit)
        .exec();
      if (!templates || templates.length === 0) {
        return [];
      }
      return templates.map((entity) =>
        TrainingTemplate.mapToOverviewDto(entity),
      );
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async startAiGeneration(
    userId: string,
    reqDto: GenerateTemplateRequestDto,
  ): Promise<TemplateResponseDto> {
    const placeholder = new this.templateModel({
      userId: new Types.ObjectId(userId),
      title: 'Generating…',
      plan: [],
      isAiGenerated: true,
      generationStatus: 'generating',
    });
    await placeholder.save();

    this.runAiGeneration(userId, placeholder._id.toString(), reqDto).catch(
      (err) => {
        console.error('AI template generation failed unexpectedly:', err);
      },
    );

    return TrainingTemplate.mapToDto(placeholder);
  }

  private async runAiGeneration(
    userId: string,
    templateId: string,
    reqDto: GenerateTemplateRequestDto,
  ): Promise<void> {
    try {
      const generated = await this.generateWithAi(userId, reqDto);
      await this.templateModel.findByIdAndUpdate(templateId, {
        title: generated.title,
        description: generated.description,
        plan: generated.plan,
        generationStatus: 'ready',
      });
    } catch {
      await this.templateModel.findByIdAndUpdate(templateId, {
        generationStatus: 'failed',
      });
    }
  }

  async generateWithAi(
    userId: string,
    reqDto: GenerateTemplateRequestDto,
  ): Promise<TemplateRequestDto> {
    const model = process.env.OLLAMA_MODEL ?? 'qwen2.5:0.5b';
    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content:
          'Du bist ein professioneller Fitness-Coach und Trainingsplan-Algorithmus. Deine Aufgabe ist es, basierend auf den Profildaten des Nutzers (unten angegeben), seinen vergangenen Trainingseinheiten des letzten Monats und dem verfügbaren Equipment seines aktuellen Fitnessstudios einen optimalen, personalisierten Trainingsplan zu erstellen. Die Trainingshistorie und das verfügbare Equipment kennst du noch nicht - nutze die dir zur Verfügung gestellten Werkzeuge aktiv, um dir beides zu beschaffen, bevor du einen Vorschlag machst. Antworte nicht, ohne diese Informationen vorher abgerufen zu haben.' +
          '### Richtlinien zur Planerstellung: 1. **Ausstattung berücksichtigen:** Wähle ausschließlich Übungen, für die das Studio das nötige Equipment bereitstellt (z. B. keine Langhantelübungen, falls keine Langhanteln vorhanden sind) 2. **Trainingshistorie analysieren:** Berücksichtige progressive Overload (Gewichts-/Wiederholungsanpassung), Erholungszeiten und welche Muskelgruppen zuletzt trainiert wurden. Vermeide Übertraining frisch beanspruchter Muskeln. 3. **Profildaten nutzen:** Passe Intensität, Volumen (Sätze/Wiederholungen) und Arbeitsgewicht an Geschlecht, Körpergröße, Gewicht und Muskelmasse des Nutzers an.',
      },
      {
        role: 'user',
        content:
          reqDto.message || 'Please suggest a new training template for me.',
      },
    ];
    const tools = this.agentToolsService.getToolSchemas();

    for (let round = 0; round < 5; round++) {
      const response = await this.ollama.callOllama(model, messages, tools);
      messages.push(response.message as OllamaMessage);

      const toolCalls = response.message.tool_calls;
      if (!toolCalls?.length) break;

      for (const call of toolCalls) {
        const result = await this.agentToolsService.executeTool(
          userId,
          reqDto.studio,
          call.function.name,
          call.function.arguments,
        );
        messages.push({
          role: 'tool',
          tool_name: call.function.name,
          content: JSON.stringify(result),
        });
      }
    }

    const final = await this.ollama.callOllama(
      model,
      messages,
      undefined,
      templateJsonSchema,
    );
    let parsed: unknown;
    try {
      parsed = JSON.parse(final.message.content);
    } catch {
      throw new InternalServerErrorException("Model didn't return valid JSON");
    }

    const dto = plainToInstance(TemplateRequestDto, parsed);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const details = errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('; ');
      throw new InternalServerErrorException(
        `Model returned invalid template: ${details}`,
      );
    }
    return dto;
  }
}
