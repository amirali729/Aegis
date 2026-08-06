import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './oauth.fake.data';

describe('oauth repository', () => {
  it('stores clients', async () => {
    type Client = { id: string; clientId: string };
    const r = createInMemoryRepo<Client>(sampleData);
    await r.create({ id: 'c2', clientId: 'c2' });
    expect((await r.findAll()).length).toBe(2);
  });
});
