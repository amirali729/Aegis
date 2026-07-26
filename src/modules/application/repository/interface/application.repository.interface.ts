import type { IApplication } from '../../model/application.model.js';
import type { Result } from '../../../../shared/result/result.js';
import type { InfrastructureError } from '../../../../shared/errors/infrastructure.error.js';
import type { CreateApplicationDto } from '../../dto/create-application.dto.js';
import type { UpdateApplicationDto } from '../../dto/update-application.dto.js';

export type DataResult<T> = Result<T, InfrastructureError>;

export interface IApplicationRepository {
  findAll(tenantId: string | undefined): Promise<DataResult<IApplication[]>>;

  findById(id: string): Promise<DataResult<IApplication | null>>;

  findByClientId(clientId: string): Promise<DataResult<IApplication | null>>;

  create(
    dto: CreateApplicationDto & {
      tenantId?: string;
      clientId: string;
      clientSecretHash: string;
    },
  ): Promise<DataResult<IApplication>>;

  update(id: string, dto: UpdateApplicationDto): Promise<DataResult<IApplication | null>>;

  updateSecretHash(id: string, clientSecretHash: string): Promise<DataResult<IApplication | null>>;

  delete(id: string): Promise<DataResult<boolean>>;
}
