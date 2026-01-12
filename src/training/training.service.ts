import { Injectable } from '@nestjs/common';
import { Training } from './schemas/training.schema';
import { Model, Types } from 'mongoose';
import { TrainingRequestDto } from './Request/training.request.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TrainingTemplate } from 'src/trainingtemplates/schemas/trainingtemplates.schema';

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
}
