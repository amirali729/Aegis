import { IUser } from "../../../../shared/database/user.model.js";
import {CreateUserDto} from "../../dto/login.dto.js";
export interface IUserRepository {
    create(user: CreateUserDto): Promise<IUser>;
    findById(id: string): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    update(user: IUser): Promise<IUser>;
    delete(id: string): Promise<void>;
}