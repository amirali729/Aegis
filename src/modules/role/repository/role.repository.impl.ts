import { InfrastructureError } from '../../../shared/errors/infrastructure.error.js';
import { err, ok } from '../../../shared/result/result.js';
import type { CreateRoleDto } from '../dto/create-role.dto.js';
import type { UpdateRoleDto } from '../dto/update-role.dto.js';
import type { IRole } from '../model/role.model.js';
import { Role } from '../model/role.model.js';
import type { DataResult, IRoleRepository } from './interface/role.repository.interface.js';

export class RoleRepository implements IRoleRepository {
  async findAll(): Promise<DataResult<IRole[]>> {
    try {
      const roles = await Role.find().populate('permissions').sort({ name: 1 });
      return ok(roles);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findById(id: string): Promise<DataResult<IRole | null>> {
    try {
      const role = await Role.findById(id).populate('permissions');
      return ok(role);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByName(name: string): Promise<DataResult<IRole | null>> {
    try {
      const role = await Role.findOne({ name });
      return ok(role);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async findByIdsWithPermissions(ids: string[]): Promise<DataResult<IRole[]>> {
    try {
      const roles = await Role.find({
        _id: { $in: ids },
      }).populate('permissions');
      return ok(roles);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async create(dto: CreateRoleDto): Promise<DataResult<IRole>> {
    try {
      const role = await Role.create({
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds,
      });
      const populated = await role.populate('permissions');
      return ok(populated);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async updateMeta(id: string, dto: UpdateRoleDto): Promise<DataResult<IRole | null>> {
    try {
      const role = await Role.findByIdAndUpdate(
        id,
        {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
        },
        { new: true },
      ).populate('permissions');
      return ok(role);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async setPermissions(id: string, permissionIds: string[]): Promise<DataResult<IRole | null>> {
    try {
      const role = await Role.findByIdAndUpdate(
        id,
        { permissions: permissionIds },
        { new: true },
      ).populate('permissions');
      return ok(role);
    } catch {
      return err(new InfrastructureError());
    }
  }

  async delete(id: string): Promise<DataResult<boolean>> {
    try {
      const result = await Role.findByIdAndDelete(id);
      return ok(!!result);
    } catch {
      return err(new InfrastructureError());
    }
  }
}
