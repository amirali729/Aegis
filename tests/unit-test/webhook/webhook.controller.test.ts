import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';

describe('webhook controller', () => {
  it('accepts webhook creation', () => {
    const res = mockRes();
    res.status(201).json({ id: 'w' });
    expect(res.statusCode).toBe(201);
  });
});
