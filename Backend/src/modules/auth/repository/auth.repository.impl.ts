import { IUser } from "../models/user.model.js";
import { CreateUserDto } from "../dto/login.dto.js";
import { IUserRepository } from "./interface/auth.repository.interface.js";

export class userRepository implements IUserRepository {
    create(user: CreateUserDto): Promise<IUser> {
        await Promise.resolve('')
    }
    delete(id: string): Promise<void> {
        
    }
    findByEmail(email: string): Promise<IUser | null> {
        
    }
    findById(id: string): Promise<IUser | null> {
        
    }
    findByUsername(username: string): Promise<IUser | null> {
        
    }
    update(user: IUser): Promise<IUser> {
        
    }
}