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

  async findAllForUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<TemplateOverviewResponseDto[]> {
    const skip = (page - 1) * limit;
    try {
      const templates = await this.templateModel
        .find({ userId: new Types.ObjectId(userId) })
        .skip(skip)
        .limit(limit)
        .exec();
      if (!templates || templates.length === 0) {
        throw new NotFoundException('No Templates found');
      }
      return templates.map((entity) =>
        TrainingTemplate.mapToOverviewDto(entity),
      );
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }
}
