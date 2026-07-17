import jwt from "jsonwebtoken"
import { IUser, User } from "../models/user.model.js";
import type  {Request,Response} from 'express';
import type { JwtPayloadWithId } from "../types/jwtPayload.js";

const logoutAll = async (req:Request, res:Response) => {
    const user = req.user as IUser;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    
    await user.save();
    return res.status(200).json({ message: "Logged out from all devices" });
};
const generateUserAccessAndRefreshToken = async (userId:string) => {
    try {
        const user = await User.findById(userId) as IUser;
        if (!user) throw new Error("User not found");
        
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        return { accessToken, refreshToken }
    }
    catch (error) {
        console.log("there some error in ",error)
    }
}

const refreshAccessToken = async (req:Request, res:Response) => {
    try {
        const incomingtoken = req.cookies.refreshToken || req.body.refreshToken
        if (!incomingtoken) {
            return res.status(401).json({
                message: "invalid authorization"
            })
        }

        const decodedToken = jwt.verify(incomingtoken,process.env.ACCESS_REFRESH_SECRET as string) as JwtPayloadWithId

        const user = await User.findById(decodedToken?._id) 

        if (!user) {
        return res.status(401).json({
            message: "invalid token"
        })
    }

    if (incomingtoken !== user?.refreshToken) {
        return res.status(401).json({
            message: "Refresh token is expired or used"
        })
    }
    const tokens = await generateUserAccessAndRefreshToken(user._id.toString());
        if (!tokens) {
            return res.status(500).json({ message: "Could not generate tokens" });
        }

        const { accessToken, refreshToken } = tokens;
    const options = {
        httpOnly: true,
        secure: true
    }
    } catch (error) {
        if (error instanceof Error) {
            return res.status(501).json({
                message: error.message
            })
        }
    }
}
export { generateUserAccessAndRefreshToken,logoutAll,refreshAccessToken}