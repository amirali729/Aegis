import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './permission.fake.data';

describe('permission repository', () => {
  it('crud', async () => {
    type Permission = { id: string; action: string };
    const r = createInMemoryRepo<Permission>(sampleData);
    await r.create({ id: 'p2', action: 'write' });
    expect((await r.findAll()).length).toBe(2);
  });
});
