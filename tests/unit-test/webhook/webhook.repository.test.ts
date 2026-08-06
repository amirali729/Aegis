import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './webhook.fake.data';

describe('webhook repository', () => {
  it('stores webhooks', async () => {
    type Webhook = { id: string; url: string };
    const r = createInMemoryRepo<Webhook>(sampleData);
    await r.create({ id: 'wh2', url: 'https://x' });
    expect((await r.findAll()).length).toBe(2);
  });
});
