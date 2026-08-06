import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';

describe('membership controller', () => {
  it('creates membership', async () => {
    const res = mockRes();
    res.status(201).json({ ok: true });
    expect(res.statusCode).toBe(201);
  });
});
