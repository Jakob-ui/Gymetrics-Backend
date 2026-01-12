export class ExerciseResponseDto {
  title: string;
  reps: number;
  repsDone?: number;
  weight?: number;
  weightDone?: number;
  factor?: number;
}

export class TrainingResponseDto {
  _id: string;
  index: number;
  userId: string;
  templateId: string;
  title: string;
  description?: string;
  active: boolean;
  activeDate: Date;
  icon?: string;
  _updatedAt: Date;
  _createdAt: Date;
  plan: ExerciseResponseDto[];
}
