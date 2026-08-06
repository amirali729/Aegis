import { beforeEach, describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './apikey.fake.data';

describe('apikey repository (in-memory)', () => {
  let repo: ReturnType<typeof createInMemoryRepo>;

  beforeEach(() => {
    repo = createInMemoryRepo(sampleData);
  });

  it('creates and reads an item', async () => {
    const newItem = { id: 'key-2', name: 'second', value: 'def' };
    await repo.create(newItem);
    const found = await repo.findById('key-2');
    expect(found).toEqual(newItem);
  });

  it('lists all items', async () => {
    const all = await repo.findAll();
    expect(all.length).toBeGreaterThan(0);
  });

  it('updates existing item and fails to update missing item', async () => {
    const updated = await repo.update('key-1', { name: 'renamed' });
    expect(updated.name).toBe('renamed');

    await expect(repo.update('nope', { name: 'x' })).rejects.toThrow();
  });

  it('deletes item and returns false for missing delete', async () => {
    const ok = await repo.delete('key-1');
    expect(ok).toBe(true);
    const ok2 = await repo.delete('missing');
    expect(ok2).toBe(false);
  });
});
