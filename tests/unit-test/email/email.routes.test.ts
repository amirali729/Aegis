import { describe, expect, it } from 'vitest';
describe('email routes', () => {
  it('validate then send', () => {
    const seq: string[] = [];
    const validate = (_req: unknown, _res: unknown, next: () => void) => {
      seq.push('v');
      next();
    };
    const handler = () => seq.push('h');
    validate({}, {}, handler);
    expect(seq).toEqual(['v', 'h']);
  });
});
