import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './role.fake.data';

describe('role service', () => {
  it('prevents duplicate roles', async () => {
    type Role = { id: string; name: string };
    const r = createInMemoryRepo<Role>(sampleData);
    const svc = {
      async add(role: Role) {
        if ((await r.findAll()).some((x) => x.name === role.name)) throw new Error('Exists');
        return r.create(role);
      },
    };
    await expect(svc.add({ id: 'r3', name: 'admin' })).rejects.toThrow('Exists');
  });
});
