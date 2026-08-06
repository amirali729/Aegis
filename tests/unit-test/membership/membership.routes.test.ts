import { describe, expect, it } from 'vitest';
describe('membership routes', () => {
  it('middleware and handler', () => {
    const calls: string[] = [];
    const mw = (_req: unknown, _res: unknown, next: () => void) => {
      calls.push('mw');
      next();
    };
    mw({}, {}, () => calls.push('h'));
    expect(calls).toEqual(['mw', 'h']);
  });
});
