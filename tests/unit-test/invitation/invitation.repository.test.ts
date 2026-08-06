import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './invitation.fake.data';

type Invitation = { id: string; email: string };

describe('invitation repository', () => {
  it('crud', async () => {
    const r = createInMemoryRepo<Invitation>(sampleData);
    await r.create({ id: 'i2', email: 'y@y.com' });
    expect((await r.findAll()).length).toBe(2);
  });
});
