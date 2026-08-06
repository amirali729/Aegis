import { describe, expect, it } from 'vitest';
describe('application routes', () => {
  it('simple middleware order', () => {
    const calls: string[] = [];
    const a = (_req: unknown, _res: unknown, next: () => void) => {
      calls.push('a');
      next();
    };
    const b = (_req: unknown, _res: unknown, next: () => void) => {
      calls.push('b');
      next();
    };
    const handler = () => calls.push('h');
    a({}, {}, () => b({}, {}, handler));
    expect(calls).toEqual(['a', 'b', 'h']);
  });
});
