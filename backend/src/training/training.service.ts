import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Training } from './schemas/training.schema';
import { Model, Types } from 'mongoose';
import { TrainingRequestDto } from './dtos/Request/training.request.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TrainingTemplate } from 'src/trainingtemplates/schemas/trainingtemplates.schema';
import { ExerciseRequestDto } from './dtos/Request/trainingUpdate.request.dto';
import { TrainingResponseDto } from './dtos/Response/training.response.dto';
import { TrainingOverviewResponseDto } from './dtos/Response/training.overview.response.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TrainingService {
  constructor(
    @InjectModel(Training.name) private trainingModel: Model<Training>,
    @InjectModel(TrainingTemplate.name)
    private trainingTemplateModel: Model<TrainingTemplate>,
  ) {}

  async createTraining(
    userId: string,
    trainingInfo: TrainingRequestDto,
  ): Promise<Training> {
    const currentDate = new Date();
    if (trainingInfo.activeDate <= currentDate) {
      throw new BadRequestException(
        'Cant create new training before current Date',
      );
    }
    try {
      const templateId = trainingInfo.templateId;
      const trainingTemplate = await this.trainingTemplateModel.findOne({
        _id: new Types.ObjectId(templateId),
        userId: new Types.ObjectId(userId),
      });
      if (!trainingTemplate) {
        throw new NotFoundException('Training template not found');
      }
      let index = await this.trainingModel.countDocuments({
        templateId: new Types.ObjectId(templateId),
        userId: new Types.ObjectId(userId),
      });
      index = index + 1;

      const { _id, plan, ...templateObjWithoutId } =
        trainingTemplate.toObject();

      const copiedPlan = plan.map((exercise) => ({
        _id: exercise._id,
        title: exercise.title,
        reps: exercise.reps,
        weight: exercise.weight,
        factor: exercise.factor,
      }));

      const trainingData = {
        ...templateObjWithoutId,
        ...trainingInfo,
        index: index,
        userId: new Types.ObjectId(userId),
        templateId: _id,
        plan: copiedPlan,
      };
      const newTraining = new this.trainingModel(trainingData);
      await newTraining.save();
      return newTraining;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async updateExercise(
    userId: string,
    trainingId: string,
    newExercise: ExerciseRequestDto,
  ): Promise<Training> {
    try {
      const training = await this.trainingModel.findOne({
        _id: new Types.ObjectId(trainingId),
        userId: new Types.ObjectId(userId),
      });
      if (!training) {
        throw new NotFoundException('Training not found');
      }
      const exercise = training.plan.find(
        (ex) => ex._id?.toString() === newExercise._id,
      );
      if (!exercise) {
        throw new NotFoundException('Exercise not found');
      }
      exercise.repsDone = newExercise.repsDone;
      exercise.weightDone = newExercise.weightDone;

      await training.save();
      return training;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async getTraining(
    userId: string,
    trainingId: string,
  ): Promise<TrainingResponseDto[]> {
    try {
      const training = await this.trainingModel.findOne({
        _id: new Types.ObjectId(trainingId),
        userId: new Types.ObjectId(userId),
      });
      if (!training) {
        throw new NotFoundException('Training not found');
      }
      const templateId: string = training.templateId?._id?.toString?.() || '';
      const currentIndex: number = training.index;
      const previousTraining = await this.trainingModel
        .findOne({
          templateId: new Types.ObjectId(templateId),
          index: { $lt: currentIndex },
        })
        .sort({ index: -1 });
      if (previousTraining) {
        return [
          Training.mapToDto(training),
          Training.mapToDto(previousTraining),
        ];
      }
      return [Training.mapToDto(training)];
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async findAllForUser(
    userId: string,
    page: number,
    limit: number,
    asc: boolean,
    sortBy: string,
    search?: string,
    active?: boolean,
  ): Promise<TrainingOverviewResponseDto[]> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const skip = (safePage - 1) * safeLimit;
    const allowedSortFields = {
      createdAt: '_createdAt',
      updatedAt: '_updatedAt',
      activeDate: 'activeDate',
    } as const;

    const sortField =
      allowedSortFields[sortBy as keyof typeof allowedSortFields] ??
      '_createdAt';

    type TrainingListFilter = {
      userId: Types.ObjectId;
      active?: boolean;
      $or?: Array<
        | { title: { $regex: string; $options: 'i' } }
        | { description: { $regex: string; $options: 'i' } }
      >;
    };

    const q = search?.trim();
    const filter: TrainingListFilter = {
      userId: new Types.ObjectId(userId),
      ...(active !== undefined ? { active } : {}),
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
      const trainingOverview = await this.trainingModel
        .find(filter)
        .sort({ [sortField]: asc ? 1 : -1 })
        .skip(skip)
        .limit(safeLimit)
        .exec();

      if (!trainingOverview || trainingOverview.length === 0) {
        throw new NotFoundException('No Trainings found');
      }
      return trainingOverview.map((entity) =>
        Training.mapToOverviewDto(entity),
      );
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async findNearestactive(
    userId: string,
    date: Date,
  ): Promise<TrainingOverviewResponseDto> {
    try {
      const result = await this.trainingModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            active: true,
          },
        },
        {
          $addFields: {
            diff: {
              $abs: { $subtract: ['$activeDate', date] },
            },
          },
        },
        {
          $sort: { diff: 1 },
        },
        {
          $limit: 1,
        },
        {
          $project: { diff: 0 },
        },
      ]);

      if (!result || result.length === 0) {
        throw new NotFoundException('No Training found');
      }

      return Training.mapToOverviewDto(result[0] as Training);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  async findTrainingsofMonth(
    userId: string,
    year: string,
    month: string,
  ): Promise<TrainingOverviewResponseDto[]> {
    const yearNum = Number(year);
    const monthNum = Number(month);
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Invalid year or month format');
    }
    const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(yearNum, monthNum, 1, 0, 0, 0));
    try {
      const trainings = await this.trainingModel.find({
        userId: new Types.ObjectId(userId),
        activeDate: { $gte: startDate, $lt: endDate },
      });

      if (!trainings || trainings.length === 0) {
        throw new NotFoundException('No Trainings found in month');
      }

      return trainings.map((entity) => Training.mapToOverviewDto(entity));
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err);
    }
  }

  @Cron('0 0 0 * * *', { name: 'dailyActivationReset' })
  async handleCron() {
    try {
      const now = new Date();
      const models: Training[] = await this.trainingModel.find().exec();
      if (models) {
        for (let i = 0; i < models.length; i++) {
          if (models[i].active && models[i].activeDate < now) {
            models[i].active = false;
            await models[i].save();
          }
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async deleteTraining(userId, trainingId) {
    try {
      const result = await this.trainingModel.deleteOne({ userId, trainingId });
      if (result.deletedCount = 1) {
        return HttpStatus.NO_CONTENT
      }
      else return HttpStatus.NOT_FOUND;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      return HttpStatus.BAD_GATEWAY;
    }
  }
}
