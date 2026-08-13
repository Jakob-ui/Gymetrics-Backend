/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it } from 'node:test';
import { RefreshAuthGuard } from './refresh.guard';

describe('RefreshAuthGuard', () => {
  it('should be defined', () => {
    expect(new RefreshAuthGuard()).toBeDefined();
  });
});
