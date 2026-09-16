export class ExerciseDoneRequestDto {
  title: string;
  repsDone?: number;
  weightDone?: number;
  constructor(init?: Partial<TrainingDoneRequestDto>) {
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
