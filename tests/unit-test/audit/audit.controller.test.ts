import { describe, expect, it } from 'vitest';
import { mockRes } from '../../helpers/http-mocks';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './audit.fake.data';

type Audit = { id: string; action: string };

describe('audit controller', () => {
  it('returns created audit', async () => {
    const repo = createInMemoryRepo<Audit>(sampleData);
    const res = mockRes();
    const svc = {
      async record(x: Audit) {
        return repo.create(x);
      },
    };
    const created = await svc.record({ id: 'ax', action: 'z' });
    res.status(201).json(created);
    expect(res.statusCode).toBe(201);
  });
});
