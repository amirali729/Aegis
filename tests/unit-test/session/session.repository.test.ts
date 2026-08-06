import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './session.fake.data';

describe('session repository', () => {
  it('manages sessions', async () => {
    type Session = { id: string; user: string };
    const r = createInMemoryRepo<Session>(sampleData);
    await r.create({ id: 's2', user: 'u2' });
    expect((await r.findAll()).length).toBe(2);
  });
});
