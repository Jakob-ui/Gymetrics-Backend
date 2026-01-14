export class ValidationResponseDto {
  userId: string;
  name: string;
  constructor(init?: Partial<ValidationResponseDto>) {
    Object.assign(this, init);
  }
}
