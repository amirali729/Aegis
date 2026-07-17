import type  { Request,Response} from 'express';
export interface IAuthController {
    signUp(req:Request,res:Response):Promise<void>;
    login(req:Request,res:Response):Promise<void>;
    logout(req:Request,res:Response):Promise<void>;
    readonly changedPassword:(req:Request,res:Response)=>Promise<void>;
    
}