import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TemplateRequestDto } from './Request/template.request.dto';
import { TrainingTemplate } from './schemas/trainingtemplates.schema';
import { TemplateResponseDto } from './Response/template.response.dto';
import { TemplateOverviewResponseDto } from './Response/templateoverview.response.dto';

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

  async updateTemplateForUser(
    userId: string,
    reqDto: TemplateRequestDto,
    templateId: string,
  ): Promise<TemplateResponseDto> {
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
  }

  async deleteTemplateForUser(userId: string, templateId: string) {
    const result = await this.templateModel.deleteOne({
      _id: new Types.ObjectId(templateId),
      userId: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Template not found');
    }
  }

  async findTemplateForUser(
    userId: string,
    templateId: string,
  ): Promise<TemplateResponseDto> {
    const template = await this.templateModel.findOne({
      _id: new Types.ObjectId(templateId),
      userId: new Types.ObjectId(userId),
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return TrainingTemplate.mapToDto(template);
  }

  async findAllForUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<TemplateOverviewResponseDto[]> {
    const skip = (page - 1) * limit;
    const templates = await this.templateModel
      .find({ userId: new Types.ObjectId(userId) })
      .skip(skip)
      .limit(limit)
      .exec();
    if (!templates) {
      throw new NotFoundException('No Templates found');
    }
    return templates.map((entity) => TrainingTemplate.mapToOverviewDto(entity));
  }
}
