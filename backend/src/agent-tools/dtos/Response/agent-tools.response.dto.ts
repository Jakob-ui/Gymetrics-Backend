export class AgentToolResponseDto<T = unknown> {
  success!: boolean;
  data?: T;
  error?: string;

  constructor(init: Partial<AgentToolResponseDto<T>>) {
    Object.assign(this, init);
  }

  static ok<T>(data: T): AgentToolResponseDto<T> {
    return new AgentToolResponseDto<T>({ success: true, data });
  }

  static fail(error: string): AgentToolResponseDto<never> {
    return new AgentToolResponseDto<never>({ success: false, error });
  }
}
