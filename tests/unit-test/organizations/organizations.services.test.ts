import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './organizations.fake.data';

type Organization = { id: string; name: string };

describe('organizations service', () => {
  it('prevents duplicate org name', async () => {
    const r = createInMemoryRepo<Organization>(sampleData);
    const svc = {
      async create(o: Organization) {
        const all = await r.findAll();
        if (all.some((x) => x.name === o.name)) throw new Error('Exists');
        return r.create(o);
      },
    };
    await expect(svc.create({ id: 'org-3', name: 'org' })).rejects.toThrow('Exists');
  });
});
