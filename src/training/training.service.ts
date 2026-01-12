import { Injectable, NotFoundException } from '@nestjs/common';
import { Training } from './schemas/training.schema';
import { Model, Types } from 'mongoose';
import { TrainingRequestDto } from './Request/training.request.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TrainingTemplate } from 'src/trainingtemplates/schemas/trainingtemplates.schema';
import { ExerciseRequestDto } from './Request/trainingUpdate.request.dto';
import { TrainingResponseDto } from './Response/training.response.dto';

@Injectable()
export class TrainingService {
  constructor(
    @InjectModel(Training.name) private trainingModel: Model<Training>,
    @InjectModel(TrainingTemplate.name)
    private trainingTemplateModel: Model<TrainingTemplate>,
  ) {}

  async createTraining(userId: string, trainingInfo: TrainingRequestDto) {
    const templateId = trainingInfo.templateId;
    const trainingTemplate = await this.trainingTemplateModel.findOne({
      _id: new Types.ObjectId(templateId),
      userId: new Types.ObjectId(userId),
    });
    if (!trainingTemplate) {
      throw new Error('Training template not found');
    }
    let index = await this.trainingModel.countDocuments({
      templateId: new Types.ObjectId(templateId),
      userId: new Types.ObjectId(userId),
    });
    index = index + 1;

    const { _id, ...templateObjWithoutId } = trainingTemplate.toObject();

    const trainingData = {
      ...templateObjWithoutId,
      ...trainingInfo,
      index: index,
      userId: new Types.ObjectId(userId),
      templateId: _id,
    };
    const newTraining = new this.trainingModel(trainingData);
    await newTraining.save();
  }

  async updateExercise(
    userId: string,
    trainingId: string,
    newExercise: ExerciseRequestDto,
  ) {
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
    return { success: true };
  }

  async getTraining(
    userId: string,
    trainingId: string,
  ): Promise<TrainingResponseDto[]> {
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
      return [Training.mapToDto(training), Training.mapToDto(previousTraining)];
    }
    return [Training.mapToDto(training)];
  }
}
