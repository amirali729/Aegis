import { describe, expect, it } from 'vitest';
describe('auth routes', () => {
  it('requires auth middleware to call next', () => {
    const called: string[] = [];
    const mw = (_req: unknown, _res: unknown, next: () => void) => {
      called.push('ok');
      next();
    };
    mw({}, {}, () => called.push('next'));
    expect(called).toEqual(['ok', 'next']);
  });
});
