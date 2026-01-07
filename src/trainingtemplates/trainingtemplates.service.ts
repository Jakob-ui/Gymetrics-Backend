import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TemplateRequestDto } from './Request/template.request.dto';
import { TrainingTemplate } from './schemas/trainingtemplates.schema';
import { TemplateResponseDto } from './Response/template.response.dto';

@Injectable()
export class TrainingtemplatesService {
  constructor(
    @InjectModel(TrainingTemplate.name)
    private templateModel: Model<TrainingTemplate>,
  ) {}

  async create(
    createDto: TemplateRequestDto,
    userId: string,
  ): Promise<TrainingTemplate> {
    const newTemplate = new this.templateModel({
      ...createDto,
      userId: new Types.ObjectId(userId),
    });
    return newTemplate.save();
  }

  async findAllForUser(userId: string): Promise<TemplateResponseDto[]> {
    const templates = await this.templateModel
      .find({ userId: new Types.ObjectId(userId) }) // Konvertiere userId zu ObjectId
      .exec();
    return templates.map((template) => this.mapToDto(template));
  }

  private mapToDto(template: TrainingTemplate): TemplateResponseDto {
    return new TemplateResponseDto({
      id: template._id.toString(),
      title: template.title,
      description: template.description,
      status: template.status,
      created_date: template._createdAt,
      updated_date: template._updatedAt,

      plan: template.plan.map((ex) => ({
        title: ex.title,
        reps: ex.reps,
        weight: ex.weight,
        factor: ex.factor,
      })),
    });
  }
}
