import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './organizations.fake.data';

type Organization = { id: string; name: string };

describe('organizations repository', () => {
  it('crud', async () => {
    const r = createInMemoryRepo<Organization>(sampleData);
    await r.create({ id: 'org-2', name: 'x' });
    expect((await r.findAll()).length).toBe(2);
  });
});
