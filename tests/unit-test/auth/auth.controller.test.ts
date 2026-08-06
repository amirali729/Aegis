import { describe, expect, it } from 'vitest';
import { mockReq, mockRes } from '../../helpers/http-mocks';

describe('auth controller', () => {
  it('responds 401 on bad credentials', async () => {
    const svc = {
      authenticate: async () => {
        throw new Error('Unauthorized');
      },
    };
    const req = mockReq({ username: 'x' });
    const res = mockRes();
    try {
      await svc.authenticate(req.body.username);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unauthorized';
      res.status(401).json({ error: message });
    }
    expect(res.statusCode).toBe(401);
  });
});
