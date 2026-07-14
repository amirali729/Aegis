// getAllUsers,getUserById,GetUser,updateUser,updateUserById,deleteUser,deleteUserById
import type  { Request,Response} from 'express';
const getAllUsers = async (req:Request, res:Response) => {
    try {
        
    } catch (error) {
        if(error instanceof Error){return res.status(500).json({
            error: error.message
        })
    }
        return res.status(500).json({
            error: error
        })
    }
}
const getUserById = async (req:Request, res:Response) => {
    try {
        
    } catch (error) {
        if(error instanceof Error){return res.status(500).json({
            error: error.message
        })
    }
        return res.status(500).json({
            error: error
        })
    }
}
const GetUser = async (req:Request, res:Response) => {
    try {
        
    } catch (error) {
        if(error instanceof Error){return res.status(500).json({
            error: error.message
        })
    }
        return res.status(500).json({
            error: error
        })
    }
}
const updateUser = async (req:Request, res:Response) => {
    try {
        
    } catch (error) {
        if(error instanceof Error){return res.status(500).json({
            error: error.message
        })
    }
        return res.status(500).json({
            error: error
        })
    }
}
const updateUserById = async (req:Request, res:Response) => {
    try {
        
    } catch (error) {
        if(error instanceof Error){return res.status(500).json({
            error: error.message
        })
    }
        return res.status(500).json({
            error: error
        })
    }
}
const deleteUser = async (req:Request, res:Response) => {
    try {
        
    } catch (error) {
        if(error instanceof Error){return res.status(500).json({
            error: error.message
        })
    }
        return res.status(500).json({
            error: error
        })
    }
}
const deleteUserById = async (req:Request, res:Response) => {
    try {
        
    } catch (error) {
        if(error instanceof Error){return res.status(500).json({
            error: error.message
        })
    }
        return res.status(500).json({
            error: error
        })
    }
}

export {getAllUsers,GetUser,getUserById,updateUser,updateUserById,deleteUser,deleteUserById}