import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './membership.fake.data';

describe('membership repository', () => {
  it('basic crud', async () => {
    type Membership = { id: string; member: string };
    const r = createInMemoryRepo<Membership>(sampleData);
    await r.create({ id: 'm2', member: 'u2' });
    expect((await r.findAll()).length).toBe(2);
  });
});
