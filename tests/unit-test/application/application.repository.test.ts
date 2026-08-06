import { beforeEach, describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './application.fake.data';

type Application = { id: string; name: string };

describe('application repository (in-memory)', () => {
  let repo: ReturnType<typeof createInMemoryRepo<Application>>;
  beforeEach(() => {
    repo = createInMemoryRepo<Application>(sampleData);
  });

  it('crud operations', async () => {
    await repo.create({ id: 'app-2', name: 'x' });
    const found = await repo.findById('app-2');
    expect(found).toBeTruthy();
    const all = await repo.findAll();
    expect(all.length).toBeGreaterThan(0);
    await repo.update('app-2', { name: 'y' });
    const del = await repo.delete('app-2');
    expect(del).toBe(true);
  });
});
