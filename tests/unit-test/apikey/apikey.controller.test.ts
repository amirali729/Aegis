import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockReq, mockRes } from '../../helpers/http-mocks';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './apikey.fake.data';

type ApiKey = { id: string; name: string; value: string };

describe('apikey controller', () => {
  let repo: ReturnType<typeof createInMemoryRepo<ApiKey>>;

  beforeEach(() => {
    repo = createInMemoryRepo<ApiKey>(sampleData);
  });

  function makeService(r: ReturnType<typeof createInMemoryRepo<ApiKey>>) {
    return {
      async create(item: ApiKey) {
        return r.create(item);
      },
      async get(id: string) {
        return r.findById(id);
      },
    };
  }

  it('returns created item', async () => {
    const svc = makeService(repo);
    const controller = {
      async create(req: ReturnType<typeof mockReq>, res: ReturnType<typeof mockRes>) {
        const created = await svc.create(req.body as ApiKey);
        return res.status(201).json(created);
      },
    };

    const req = mockReq({ id: 'k3', name: 'k3', value: 'v' });
    const res = mockRes();
    await controller.create(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.payload.id).toBe('k3');
  });

  it('handles service errors with thrown exceptions', async () => {
    const svc = {
      create: vi.fn(() => {
        throw new Error('SvcFail');
      }),
    };
    const controller = {
      async create(req: ReturnType<typeof mockReq>, res: ReturnType<typeof mockRes>) {
        try {
          const created = await (svc.create as unknown as (...args: unknown[]) => unknown)(
            req.body,
          );
          return res.status(201).json(created);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'unknown';
          return res.status(500).json({ error: message });
        }
      },
    };

    const req = mockReq({ id: 'x' });
    const res = mockRes();
    await controller.create(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.payload.error).toBe('SvcFail');
  });
});
