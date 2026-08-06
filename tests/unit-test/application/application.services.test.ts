import { beforeEach, describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './application.fake.data';

type Application = { id: string; name?: string };

describe('application service', () => {
  let repo: ReturnType<typeof createInMemoryRepo<Application>>;
  beforeEach(() => {
    repo = createInMemoryRepo<Application>(sampleData);
  });

  it('business rule: name required', async () => {
    const svc = {
      async create(item: Application) {
        if (!item.name) throw new Error('BadRequest');
        return repo.create(item as Application);
      },
    };
    await expect(svc.create({ id: 'a' })).rejects.toThrow('BadRequest');
  });
});
