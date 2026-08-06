import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './permission.fake.data';

describe('permission service', () => {
  it('checks permission presence', async () => {
    type Permission = { id: string; action: string };
    const r = createInMemoryRepo<Permission>(sampleData);
    const svc = {
      async exists(action: string) {
        return (await r.findAll()).some((p) => p.action === action);
      },
    };
    expect(await svc.exists('read')).toBe(true);
  });
});
