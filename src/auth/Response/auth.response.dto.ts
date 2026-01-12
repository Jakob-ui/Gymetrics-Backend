export class AuthResponseDto {
  userId: string;
  name: string;
  token: string;
  constructor(init?: Partial<AuthResponseDto>) {
    Object.assign(this, init);
  }
}
