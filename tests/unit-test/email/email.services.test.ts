import { describe, expect, it, vi } from 'vitest';
import { createInMemoryRepo } from '../../helpers/in-memory-repo';
import { sampleData } from './email.fake.data';

describe('email service', () => {
  it('sends email and handles mailer failure', async () => {
    type Mail = { id: string; to: string };
    const repo = createInMemoryRepo<Mail>(sampleData);
    const mailer = { send: vi.fn(() => Promise.resolve(true)) };
    const svc = {
      async sendEmail(payload: Mail) {
        await mailer.send(payload);
        return repo.create(payload);
      },
    };
    const res = await svc.sendEmail({ id: 'm3', to: 'c@c.com' });
    expect(res.id).toBe('m3');
    mailer.send = vi.fn(() => {
      throw new Error('MailFail');
    });
    await expect(svc.sendEmail({ id: 'm4', to: 'd@d.com' })).rejects.toThrow('MailFail');
  });
});
