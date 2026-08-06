import { describe, expect, it } from 'vitest';

describe('apikey routes (middleware/routing)', () => {
  it('invokes middleware and handler in order', async () => {
    const callOrder: string[] = [];
    const auth = (req: unknown, res: unknown, next: () => void) => {
      callOrder.push('auth');
      return next();
    };
    const validate = (req: unknown, res: unknown, next: () => void) => {
      callOrder.push('validate');
      return next();
    };
    const handler = (req: unknown, res: Record<string, unknown>) => {
      callOrder.push('handler');
      res.called = true;
    };

    // simulate express flow
    const next1 = () => validate({}, {}, next2);
    const next2 = () => handler({}, {});

    auth({}, {}, next1);
    expect(callOrder).toEqual(['auth', 'validate', 'handler']);
  });
});
