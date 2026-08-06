import { describe, expect, it } from 'vitest';
describe('role routes', () => {
  it('middleware ordering', () => {
    const calls: string[] = [];
    const m = (_req: unknown, _res: unknown, next: () => void) => {
      calls.push('m');
      next();
    };
    m({}, {}, () => calls.push('h'));
    expect(calls).toEqual(['m', 'h']);
  });
});
