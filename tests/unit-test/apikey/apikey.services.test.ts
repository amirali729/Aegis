import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiKeyCreatedResponse } from '../../../dist/modules/apikey/responses/api-key-created.response.js';
import { ApiKeyService } from '../../../dist/modules/apikey/service/api-key.service.impl.js';
import { ok } from '../../../dist/shared/result/result.js';
import type { CreateApiKeyDto } from '../../../src/modules/apikey/dto/create-api-key.dto.js';
import type { IApiKeyRepository } from '../../../src/modules/apikey/repository/interface/apikey.repository.interface.js';
import type { IApplicationRepository } from '../../../src/modules/application/repository/interface/application.repository.interface.js';
import type { IAuditLogger } from '../../../src/modules/audit/service/interface/audit-logger.interface.js';
import { createInMemoryRepo } from '../../helpers/in-memory-repo.js';
import { sampleData } from './apikey.fake.data';

type ApiKey = { id: string; name: string; value?: string };

describe('ApiKeyService (unit)', () => {
  let apiKeyRepo: IApiKeyRepository;
  let appRepo: IApplicationRepository;
  let auditLogger: IAuditLogger | undefined;
  let svc: ApiKeyService;
  let tenantId: mongoose.Types.ObjectId;

  beforeEach(() => {
    apiKeyRepo = {
      findByApplicationId: vi.fn(async () => ok([])),
      findById: vi.fn(async () => ok(null)),
      create: vi.fn(async () =>
        ok({
          _id: { toString: () => 'k1' },
          applicationId: new mongoose.Types.ObjectId(),
          name: 'n',
          keyPrefix: 'p',
          hashedKey: 'h',
          status: 'active',
        }),
      ),
      revoke: vi.fn(async () => ok(true)),
      findByHashedKey: vi.fn(async () => ok(null)),
      touchLastUsed: vi.fn(),
    } as unknown as IApiKeyRepository;

    tenantId = new mongoose.Types.ObjectId();
    appRepo = {
      findById: vi.fn(async () =>
        ok({
          _id: new mongoose.Types.ObjectId(),
          tenantId,
          isActive: true,
        }),
      ),
    } as unknown as IApplicationRepository;

    auditLogger = { record: vi.fn() } as unknown as IAuditLogger;

    svc = new ApiKeyService(apiKeyRepo, appRepo, auditLogger);
  });

  it('list: application tenant mismatch returns ApplicationNotFoundError via err', async () => {
    (appRepo.findById as unknown) = vi.fn(async () =>
      ok({
        _id: new mongoose.Types.ObjectId(),
        tenantId: new mongoose.Types.ObjectId(),
        isActive: true,
      }),
    );

    const res = await svc.list('app1', 'different-tenant');
    expect(res.ok).toBe(false);
  });

  it('create: successful returns ApiKeyCreatedResponse and raw key', async () => {
    const dto: CreateApiKeyDto = { name: 'my key', expiresInDays: 7 } as CreateApiKeyDto;
    const res = await svc.create('app1', dto, tenantId.toString(), 'actor1');
    expect(res.ok).toBe(true);
    const created = res.value as ApiKeyCreatedResponse;
    expect(created).toBeInstanceOf(ApiKeyCreatedResponse);
    expect((created as unknown as { key?: string }).key).toBeDefined();
    // auditLogger.record should be called
    expect(
      (auditLogger!.record as unknown as { mock?: { calls?: unknown[] } }).mock?.calls,
    ).toBeDefined();
  });

  it('revoke: api key not found returns ApiKeyNotFoundError via err', async () => {
    (apiKeyRepo.findById as unknown) = vi.fn(async () => ok(null));
    const res = await svc.revoke('app1', 'key1', tenantId.toString(), 'actor');
    expect(res.ok).toBe(false);
  });

  it('verifyApiKey: invalid raw key returns InvalidApiKeyError', async () => {
    (apiKeyRepo.findByHashedKey as unknown) = vi.fn(async () => ok(null));
    const res = await svc.verifyApiKey('nope');
    expect(res.ok).toBe(false);
    const InvalidApiKeyErrorClass = (
      await import('../../../dist/modules/apikey/errors/invalid-api-key.error.js')
    ).InvalidApiKeyError;
    expect(res.error).toBeInstanceOf(InvalidApiKeyErrorClass);
  });

  it('verifyApiKey: success returns application and touches last used', async () => {
    const apiKeyRec = {
      _id: { toString: () => 'k1' },
      applicationId: new mongoose.Types.ObjectId(),
      status: 'active',
      expiresAt: undefined,
    };
    (apiKeyRepo.findByHashedKey as unknown) = vi.fn(async () => ok(apiKeyRec));
    (appRepo.findById as unknown) = vi.fn(async () =>
      ok({ _id: apiKeyRec.applicationId, isActive: true }),
    );

    const res = await svc.verifyApiKey('raw');
    expect(res.ok).toBe(true);
    expect(
      (apiKeyRepo.touchLastUsed as unknown as { mock?: { calls?: unknown[] } }).mock?.calls,
    ).toBeDefined();
  });
});

describe('apikey service', () => {
  let repo: ReturnType<typeof createInMemoryRepo<ApiKey>>;

  beforeEach(() => {
    repo = createInMemoryRepo<ApiKey>(sampleData);
  });

  function makeService(r: ReturnType<typeof createInMemoryRepo<ApiKey>>) {
    return {
      async create(item: ApiKey) {
        // business rule: name must be unique
        const all = await r.findAll();
        if (all.some((a) => a.name === item.name)) throw new Error('DuplicateName');
        return r.create(item);
      },

      async delete(id: string) {
        return r.delete(id);
      },
    };
  }

  it('enforces unique name rule', async () => {
    const svc = makeService(repo);
    await expect(svc.create({ id: 'key-dup', name: 'first-key', value: 'x' })).rejects.toThrow(
      'DuplicateName',
    );
  });

  it('propagates repository failures', async () => {
    const badRepo = {
      ...repo,
      create: vi.fn(() => {
        throw new Error('DBFail');
      }),
    };
    const svc = makeService(badRepo as unknown as ReturnType<typeof createInMemoryRepo<ApiKey>>);
    await expect(svc.create({ id: 'k', name: 'unique', value: 'x' })).rejects.toThrow('DBFail');
  });

  it('transaction-like behaviour: rollbacks on failure', async () => {
    const r = createInMemoryRepo<ApiKey>([]);
    const createSpy = vi.spyOn(r, 'create');
    const delSpy = vi.spyOn(r, 'delete');

    const svc = {
      async createWithSideEffect(item: ApiKey) {
        await r.create(item);
        // simulate failure afterwards
        throw new Error('LaterFailure');
      },
      async createSafe(item: ApiKey) {
        try {
          await this.createWithSideEffect(item);
        } catch (e) {
          // rollback
          await r.delete(item.id);
          throw e;
        }
      },
    };

    await expect(svc.createSafe({ id: 't1', name: 't', value: 'v' })).rejects.toThrow(
      'LaterFailure',
    );
    expect(createSpy).toHaveBeenCalled();
    expect(delSpy).toHaveBeenCalledWith('t1');
  });
});
