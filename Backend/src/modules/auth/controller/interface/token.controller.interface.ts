import type  { Request,Response} from 'express';
export interface ITokenController {
    logoutAll(req:Request,res:Response):Promise<void>
    readonly refreshAccessToken:(req:Request,res:Response)=>Promise<void>
    readonly generateUserAccessAndRefreshToken:(userId:string)=>Promise<{accessToken:string,refreshToken:string}|undefined>

}