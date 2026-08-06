import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';

describe('permission controller', () => {
  it('responds 200 ok', () => {
    const res = mockRes();
    res.status(200).json({ ok: true });
    expect(res.statusCode).toBe(200);
  });
});
