import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './email.fake.data';

describe('email repository', () => {
  it('stores emails', async () => {
    type Mail = { id: string; to: string };
    const r = createInMemoryRepo<Mail>(sampleData);
    await r.create({ id: 'm2', to: 'b@b.com' });
    const all = await r.findAll();
    expect(all.length).toBe(2);
  });
});
