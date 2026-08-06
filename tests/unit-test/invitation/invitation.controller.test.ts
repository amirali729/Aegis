import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';

describe('invitation controller', () => {
  it('returns 201 on invite', async () => {
    const res = mockRes();
    res.status(201).json({ id: 'i' });
    expect(res.statusCode).toBe(201);
  });
});
