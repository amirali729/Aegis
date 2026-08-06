import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './session.fake.data';

describe('session service', () => {
  it('creates and invalidates session', async () => {
    type Session = { id: string; user: string };
    const r = createInMemoryRepo<Session>(sampleData);
    const svc = {
      async create(s: Session) {
        return r.create(s);
      },
      async invalidate(id: string) {
        return r.delete(id);
      },
    };
    await svc.create({ id: 's3', user: 'u3' });
    expect(await svc.invalidate('s3')).toBe(true);
  });
});
