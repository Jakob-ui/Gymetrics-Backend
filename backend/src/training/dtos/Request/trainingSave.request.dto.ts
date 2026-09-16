export class ExerciseDoneRequestDto {
  _id?: string;
  title: string;
  repsDone?: number;
  weightDone?: number;
  constructor(init?: Partial<ExerciseDoneRequestDto>) {
    Object.assign(this, init);
  }
}

export class TrainingDoneRequestDto {
  active: boolean;
  plan: ExerciseDoneRequestDto[];
  constructor(init?: Partial<TrainingDoneRequestDto>) {
    Object.assign(this, init);
  }
}
