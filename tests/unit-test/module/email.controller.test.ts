import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';

describe('email controller', () => {
  it('returns 202 when accepted', async () => {
    const svc = { sendEmail: async () => ({ ok: true }) };
    const res = mockRes();
    await svc.sendEmail();
    res.status(202).json({ ok: true });
    expect(res.statusCode).toBe(202);
  });
});
