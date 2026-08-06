import { describe, expect, it } from 'vitest';
describe('audit routes', () => {
  it('middleware chain', () => {
    const seq: string[] = [];
    const m1 = (_req: unknown, _res: unknown, next: () => void) => {
      seq.push('1');
      next();
    };
    const m2 = (_req: unknown, _res: unknown, next: () => void) => {
      seq.push('2');
      next();
    };
    m1({}, {}, () => m2({}, {}, () => seq.push('h')));
    expect(seq).toEqual(['1', '2', 'h']);
  });
});
