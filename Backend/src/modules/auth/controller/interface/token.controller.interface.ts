import type  { Request,Response} from 'express';
export interface ITokenController {
    
    readonly refreshAccessToken:(req:Request,res:Response)=>Promise<void>
    readonly generateUserAccessAndRefreshToken:(userId:string)=>Promise<{accessToken:string,refreshToken:string}|undefined>

}