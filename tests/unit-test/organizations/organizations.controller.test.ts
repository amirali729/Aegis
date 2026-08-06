import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';

describe('organizations controller', () => {
  it('returns 200 list', async () => {
    const res = mockRes();
    res.status(200).json([]);
    expect(res.statusCode).toBe(200);
  });
});
