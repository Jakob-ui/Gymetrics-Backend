export class ExerciseResponseDto {
  title: string;
  reps: number;
  repsDone?: number;
  weight?: number;
  weightDone?: number;
  factor?: number;
  constructor(init?: Partial<TrainingResponseDto>) {
    Object.assign(this, init);
  }
}

export class TrainingResponseDto {
  _id: string;
  templateId: string;
  title: string;
  description?: string;
  active: boolean;
  activeDate: Date;
  icon?: string;
  _updatedAt: Date;
  _createdAt: Date;
  plan: ExerciseResponseDto[];
  constructor(init?: Partial<TrainingResponseDto>) {
    Object.assign(this, init);
  }
}
