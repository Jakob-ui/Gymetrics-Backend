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
}
