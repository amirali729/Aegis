import { beforeEach, describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './audit.fake.data';

type Audit = { id: string; action: string };

describe('audit repository', () => {
  let repo: ReturnType<typeof createInMemoryRepo<Audit>>;
  beforeEach(() => {
    repo = createInMemoryRepo<Audit>(sampleData);
  });

  it('records and queries', async () => {
    await repo.create({ id: 'a2', action: 'x' });
    const all = await repo.findAll();
    expect(all.length).toBeGreaterThan(0);
  });
});
