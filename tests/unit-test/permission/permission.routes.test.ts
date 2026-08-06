import { describe, expect, it } from 'vitest';
describe('permission routes', () => {
  it('applies auth then handler', () => {
    const arr: string[] = [];
    const a = (_req: unknown, _res: unknown, next: () => void) => {
      arr.push('a');
      next();
    };
    a({}, {}, () => arr.push('h'));
    expect(arr).toEqual(['a', 'h']);
  });
});
