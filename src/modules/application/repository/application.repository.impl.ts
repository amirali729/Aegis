import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { CreateApplicationDto } from '../dto/create-application.dto.js';
import type { UpdateApplicationDto } from '../dto/update-application.dto.js';
import type { IApplication } from '../model/application.model.js';
import { Application } from '../model/application.model.js';
import type {
  DataResult,
  IApplicationRepository,
} from './interface/application.repository.interface.js';

export class ApplicationRepository implements IApplicationRepository {
  async findAll(tenantId: string | undefined): Promise<DataResult<IApplication[]>> {
    try {
      const applications = await Application.find(tenantId ? { tenantId } : {}).sort({ name: 1 });
      return ok(applications);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findById(id: string): Promise<DataResult<IApplication | null>> {
    try {
      const application = await Application.findById(id);
      return ok(application);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByClientId(clientId: string): Promise<DataResult<IApplication | null>> {
    try {
      const application = await Application.findOne({
        clientId,
      });
      return ok(application);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async create(
    dto: CreateApplicationDto & {
      tenantId?: string;
      clientId: string;
      clientSecretHash: string;
    },
  ): Promise<DataResult<IApplication>> {
    try {
      const application = await Application.create({
        tenantId: dto.tenantId,
        name: dto.name,
        clientId: dto.clientId,
        clientSecretHash: dto.clientSecretHash,
        allowedOrigins: dto.allowedOrigins,
        redirectUris: dto.redirectUris,
        accessTokenTTL: dto.accessTokenTTL,
        refreshTokenTTL: dto.refreshTokenTTL,
      });
      return ok(application);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async update(id: string, dto: UpdateApplicationDto): Promise<DataResult<IApplication | null>> {
    try {
      const application = await Application.findByIdAndUpdate(
        id,
        {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.allowedOrigins !== undefined && {
            allowedOrigins: dto.allowedOrigins,
          }),
          ...(dto.redirectUris !== undefined && {
            redirectUris: dto.redirectUris,
          }),
          ...(dto.accessTokenTTL !== undefined && {
            accessTokenTTL: dto.accessTokenTTL,
          }),
          ...(dto.refreshTokenTTL !== undefined && {
            refreshTokenTTL: dto.refreshTokenTTL,
          }),
          ...(dto.isActive !== undefined && {
            isActive: dto.isActive,
          }),
        },
        { new: true },
      );
      return ok(application);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async updateSecretHash(
    id: string,
    clientSecretHash: string,
  ): Promise<DataResult<IApplication | null>> {
    try {
      const application = await Application.findByIdAndUpdate(
        id,
        { clientSecretHash },
        { new: true },
      );
      return ok(application);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async delete(id: string): Promise<DataResult<boolean>> {
    try {
      const result = await Application.findByIdAndDelete(id);
      return ok(!!result);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
