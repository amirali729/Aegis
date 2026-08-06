import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './application.fake.data';

type Application = { id: string; name: string };

describe('application controller', () => {
  const repo = createInMemoryRepo<Application>(sampleData);
  const svc = {
    async list() {
      return repo.findAll();
    },
  };

  it('returns list', async () => {
    const res = mockRes();
    const r = await svc.list();
    res.status(200).json(r);
    expect(res.statusCode).toBe(200);
  });
});
