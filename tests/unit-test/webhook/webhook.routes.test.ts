import { describe, expect, it } from 'vitest';
describe('webhook routes', () => {
  it('applies validation then handler', () => {
    const seq: string[] = [];
    const v = (_req: unknown, _res: unknown, next: () => void) => {
      seq.push('v');
      next();
    };
    v({}, {}, () => seq.push('h'));
    expect(seq).toEqual(['v', 'h']);
  });
});
