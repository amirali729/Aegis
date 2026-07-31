import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { CreatePermissionDto } from '../dto/create-permission.dto.js';
import type { UpdatePermissionDto } from '../dto/update-permission.dto.js';
import type { IPermission } from '../model/permission.model.js';
import { Permission } from '../model/permission.model.js';
import type {
  DataResult,
  IPermissionRepository,
} from './interface/permission.repository.interface.js';

export class PermissionRepository implements IPermissionRepository {
  async findAll(tenantId: string | undefined): Promise<DataResult<IPermission[]>> {
    try {
      const permissions = await Permission.find({ tenantId }).sort({
        key: 1,
      });
      return ok(permissions);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findById(id: string): Promise<DataResult<IPermission | null>> {
    try {
      const permission = await Permission.findById(id);
      return ok(permission);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByKey(key: string, tenantId?: string): Promise<DataResult<IPermission | null>> {
    try {
      const permission = await Permission.findOne({ key, tenantId });
      return ok(permission);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByIds(ids: string[]): Promise<DataResult<IPermission[]>> {
    try {
      const permissions = await Permission.find({
        _id: { $in: ids },
      });
      return ok(permissions);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async create(dto: CreatePermissionDto): Promise<DataResult<IPermission>> {
    try {
      const permission = await Permission.create({
        key: dto.key,
        description: dto.description,
      });
      return ok(permission);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async update(id: string, dto: UpdatePermissionDto): Promise<DataResult<IPermission | null>> {
    try {
      const permission = await Permission.findByIdAndUpdate(
        id,
        { description: dto.description },
        { new: true },
      );
      return ok(permission);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async delete(id: string): Promise<DataResult<boolean>> {
    try {
      const result = await Permission.findByIdAndDelete(id);
      return ok(!!result);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
