import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './role.fake.data';

describe('role repository', () => {
  it('crud operations', async () => {
    type Role = { id: string; name: string };
    const r = createInMemoryRepo<Role>(sampleData);
    await r.create({ id: 'r2', name: 'user' });
    expect((await r.findAll()).length).toBe(2);
  });
});
