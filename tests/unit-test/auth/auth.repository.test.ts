import { describe, expect, it } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './auth.fake.data';

describe('auth repository', () => {
  it('creates and finds users', async () => {
    type User = { id: string; username: string };
    const repo = createInMemoryRepo<User>(sampleData);
    await repo.create({ id: 'u2', username: 'bob' });
    const u = await repo.findById('u2');
    expect(u.username).toBe('bob');
  });
});
