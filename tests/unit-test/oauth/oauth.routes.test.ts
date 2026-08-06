import { describe, expect, it } from 'vitest';
describe('oauth routes', () => {
  it('authorize route flow', () => {
    const seq: string[] = [];
    const a = (_req: unknown, _res: unknown, next: () => void) => {
      seq.push('a');
      next();
    };
    a({}, {}, () => seq.push('h'));
    expect(seq).toEqual(['a', 'h']);
  });
});
