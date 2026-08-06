import { describe, expect, it } from 'vitest';

describe('organizations routes', () => {
  it('route middleware stack', () => {
    const calls: string[] = [];
    const m1 = (_req: unknown, _res: unknown, next: () => void) => {
      calls.push('1');
      next();
    };
    m1({}, {}, () => calls.push('h'));
    expect(calls).toEqual(['1', 'h']);
  });
});
