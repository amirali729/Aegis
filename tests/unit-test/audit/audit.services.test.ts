import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './audit.fake.data';

describe('audit service', () => {
  it('writes audit entries via repo', async () => {
    type Audit = { id: string; action: string };
    const repo = createInMemoryRepo<Audit>(sampleData);
    const svc = {
      async record(entry: Audit) {
        return repo.create(entry);
      },
    };
    const e = await svc.record({ id: 'a3', action: 'u' });
    expect(e.id).toBe('a3');
  });
});
