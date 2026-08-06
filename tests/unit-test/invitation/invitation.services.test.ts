import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './invitation.fake.data';

type Invitation = { id: string; email: string };

describe('invitation service', () => {
  it('rejects duplicate email', async () => {
    const r = createInMemoryRepo<Invitation>(sampleData);
    const svc = {
      async invite(payload: Invitation) {
        const all = await r.findAll();
        if (all.some((a) => a.email === payload.email)) throw new Error('Duplicate');
        return r.create(payload);
      },
    };
    await expect(svc.invite({ id: 'i3', email: 'x@x.com' })).rejects.toThrow('Duplicate');
  });
});
