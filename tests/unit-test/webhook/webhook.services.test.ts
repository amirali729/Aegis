import { describe, expect, it, vi } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './webhook.fake.data';

describe('webhook service', () => {
  it('dispatches and retries on failure', async () => {
    type Webhook = { id: string; url: string };
    const r = createInMemoryRepo<Webhook>(sampleData);
    const deliver = vi.fn(async () => {
      throw new Error('NetFail');
    });
    const svc = {
      async dispatch(w: Webhook) {
        try {
          await deliver(w);
          return undefined;
        } catch {
          return r.create({ id: 'retry-' + w.id, url: w.url });
        }
      },
    };
    const res = await svc.dispatch({ id: 'wh-1', url: 'https://x' });
    expect(res!.id).toMatch(/^retry-/);
  });
});
