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
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
    return templates.map((entity) => TrainingTemplate.mapToDto(entity));
  }
}
