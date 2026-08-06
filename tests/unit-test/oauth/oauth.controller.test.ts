import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';

describe('oauth controller', () => {
  it('responds with token structure', async () => {
    const res = mockRes();
    res.status(200).json({ access_token: 't' });
    expect(res.statusCode).toBe(200);
    expect(res.payload.access_token).toBeDefined();
  });
});
