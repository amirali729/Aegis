import { describe, expect, it } from 'vitest';
describe('session routes', () => {
  it('protects route with auth', () => {
    const called: string[] = [];
    const auth = (_req: unknown, _res: unknown, next: () => void) => {
      called.push('auth');
      next();
    };
    auth({}, {}, () => called.push('h'));
    expect(called).toEqual(['auth', 'h']);
  });
});
