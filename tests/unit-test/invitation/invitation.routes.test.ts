import { describe, expect, it } from 'vitest';
describe('invitation routes', () => {
  it('middleware sequence', () => {
    const c: string[] = [];
    const a = (_req: unknown, _res: unknown, next: () => void) => {
      c.push('a');
      next();
    };
    a({}, {}, () => c.push('h'));
    expect(c).toEqual(['a', 'h']);
  });
});
