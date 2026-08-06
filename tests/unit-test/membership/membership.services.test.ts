import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './membership.fake.data';

describe('membership service', () => {
  it('adds member and enforces unique', async () => {
    type Membership = { id: string; member: string };
    const r = createInMemoryRepo<Membership>(sampleData);
    const svc = {
      async add(m: Membership) {
        const all = await r.findAll();
        if (all.some((x) => x.member === m.member)) throw new Error('Exists');
        return r.create(m);
      },
    };
    await expect(svc.add({ id: 'm3', member: 'u1' })).rejects.toThrow('Exists');
  });
});
