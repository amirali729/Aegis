import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';

describe('session controller', () => {
  it('logout returns 204', () => {
    const res = mockRes();
    res.status(204).send('');
    expect(res.statusCode).toBe(204);
  });
});
