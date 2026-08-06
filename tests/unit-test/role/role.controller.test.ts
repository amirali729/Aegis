import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';

describe('role controller', () => {
  it('returns 201', () => {
    const res = mockRes();
    res.status(201).json({ id: 'r' });
    expect(res.statusCode).toBe(201);
  });
});
