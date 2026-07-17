import { IAuthController } from "./interface/auth.controller.interface.js";
import { IUser, User } from "../models/user.model.js";  
import { generateUserAccessAndRefreshToken } from "./token.controller.impl.js";
import type  { Request,Response} from 'express';




const signUp = async (req:Request, res:Response) => {
    try {
        const { username, password, email } = req.body

        if (!username || !password) {
            return res.status(401).json({
                message: "please provide both username and password"
            })
        }

        if (!email?.trim() || !username?.trim() || !password) {
    return res.status(400).json({
        message: "Email, username, and password are required"
    })
}

        const existingUser = await User.findOne({
            $or: [
                { username },
                { email }
            ]
        })

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(401).json({
                    message: "email already exists"
                })
            }
            if (existingUser.username === username) {
                return res.status(401).json({
                    message: "username already exists"
                })
            }
        }

        const user = await User.create({ username, password, email })

        const createdUser = await User.findById(user._id)
            .select("-password")
            .lean()
        // await 

        if (!createdUser) {
            return res.status(500).json({
                message: "there some error in creating your account"
            })
        }

        return res.status(201).json({
            message: "you are account has been created",
            createdUser
        })
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

const login = async (req:Request, res:Response) => {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(401).json({
                message: "!User is not found please provide the username and password"
            })
        }

        const user = await User.findOne({username})
        if (!user) {
            return res.status(401).json({
                message: "please create your account first through signing up"
            })
        }
        const passwordValidate = await user.isPasswordCorrect(password)

        if (!passwordValidate) {
            return res.status(401).json({
                message: "Password is incorrect !please try again"
            })
        }

        const tokens = await generateUserAccessAndRefreshToken(user._id.toString());
        if (!tokens) {
            return res.status(500).json({ message: "Could not generate tokens" });
        }

        const { accessToken, refreshToken } = tokens;

        const loginUser = await User.findById(user._id)
            .select("-password -refreshToken")
            .lean()

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                {
                    message: "user logged in successfully",
                    user: loginUser, accessToken, refreshToken
                },
                
            )

    } catch (error) {
        if (error instanceof Error) return res.status(500).json({ error: error.message });
        return res.status(500).json({ error: "Unknown error" });
    }
}


const changedPassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = req.user as IUser;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (![oldPassword, newPassword, confirmPassword].every(
      field => typeof field === "string" && field.trim() !== ""
    )) {
      return res.status(400).json({
        message: "Please provide all fields"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match"
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    const isCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isCorrect) {
      return res.status(401).json({
        message: "Old password is incorrect"
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully"
    });

  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unknown error" });
  }
};


// const userProfile = async (req:Request ,res:Response) => {
//     const user = req.user as IUser;
//     if (!user) {
//         return res.status(401).json({
//             message: "Unauthorized"
//         })
//     }
//     return res.status(201).json({
//         user,
//         message: "User profile fetched successfully"
//     })
// }
const logout = async (req:Request,res:Response) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
            {
                new: true
            },
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({message: "you have been logout"})
}


// class AuthController implements IAuthController {
    //     constructor(
    //     private readonly userRepository: IUserRepository
    // ) {}
//     const signUp = async (req:Request, res:Response) => {
//     try {
//         const { username, password, email } = req.body

//         if (!username || !password) {
//             return res.status(401).json({
//                 message: "please provide both username and password"
//             })
//         }

//         if (!email?.trim() || !username?.trim() || !password) {
//     return res.status(400).json({
//         message: "Email, username, and password are required"
//     })
// }

//         const existingUser = await User.findOne({
//             $or: [
//                 { username },
//                 { email }
//             ]
//         })

//         if (existingUser) {
//             if (existingUser.email === email) {
//                 return res.status(401).json({
//                     message: "email already exists"
//                 })
//             }
//             if (existingUser.username === username) {
//                 return res.status(401).json({
//                     message: "username already exists"
//                 })
//             }
//         }

//         const user = await User.create({ username, password, email })

//         const createdUser = await User.findById(user._id)
//             .select("-password")
//             .lean()
//         // await 

//         if (!createdUser) {
//             return res.status(500).json({
//                 message: "there some error in creating your account"
//             })
//         }

//         return res.status(201).json({
//             message: "you are account has been created",
//             createdUser
//         })
//     } catch (error) {
//         if(error instanceof Error){return res.status(500).json({
//             error: error.message
//         })
//     }
//         return res.status(500).json({
//             error: error
//         })
//     }
// }

// const login = async (req:Request, res:Response) => {
//     try {
//         const { username, password } = req.body

//         if (!username || !password) {
//             return res.status(401).json({
//                 message: "!User is not found please provide the username and password"
//             })
//         }

//         const user = await User.findOne({username})
//         if (!user) {
//             return res.status(401).json({
//                 message: "please create your account first through signing up"
//             })
//         }
//         const passwordValidate = await user.isPasswordCorrect(password)

//         if (!passwordValidate) {
//             return res.status(401).json({
//                 message: "Password is incorrect !please try again"
//             })
//         }

//         const tokens = await generateUserAccessAndRefreshToken(user._id.toString());
//         if (!tokens) {
//             return res.status(500).json({ message: "Could not generate tokens" });
//         }

//         const { accessToken, refreshToken } = tokens;

//         const loginUser = await User.findById(user._id)
//             .select("-password -refreshToken")
//             .lean()

//         const options = {
//             httpOnly: true,
//             secure: true
//         }

//         return res
//             .status(201)
//             .cookie("accessToken", accessToken, options)
//             .cookie("refreshToken", refreshToken, options)
//             .json(
//                 {
//                     message: "user logged in successfully",
//                     user: loginUser, accessToken, refreshToken
//                 },
                
//             )

//     } catch (error) {
//         if (error instanceof Error) return res.status(500).json({ error: error.message });
//         return res.status(500).json({ error: "Unknown error" });
//     }
// }


// const changedPassword = async (req: Request, res: Response) => {
//   try {
//     const { oldPassword, newPassword, confirmPassword } = req.body;
//     const user = req.user as IUser;

//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (![oldPassword, newPassword, confirmPassword].every(
//       field => typeof field === "string" && field.trim() !== ""
//     )) {
//       return res.status(400).json({
//         message: "Please provide all fields"
//       });
//     }

//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({
//         message: "New password and confirm password do not match"
//       });
//     }

//     if (newPassword.length < 8) {
//       return res.status(400).json({
//         message: "Password must be at least 8 characters long"
//       });
//     }

//     const isCorrect = await user.isPasswordCorrect(oldPassword);
//     if (!isCorrect) {
//       return res.status(401).json({
//         message: "Old password is incorrect"
//       });
//     }

//     user.password = newPassword;
//     await user.save();

//     return res.status(200).json({
//       message: "Password changed successfully"
//     });

//   } catch (error) {
//     if (error instanceof Error) {
//       return res.status(500).json({ error: error.message });
//     }
//     return res.status(500).json({ error: "Unknown error" });
//   }
// };


// // const userProfile = async (req:Request ,res:Response) => {
// //     const user = req.user as IUser;
// //     if (!user) {
// //         return res.status(401).json({
// //             message: "Unauthorized"
// //         })
// //     }
// //     return res.status(201).json({
// //         user,
// //         message: "User profile fetched successfully"
// //     })
// // }
// const logout = async (req:Request,res:Response) => {
//     await User.findByIdAndUpdate(
//         req.user._id,
//         {
//             $unset: {
//                 refreshToken: 1
//             }
//         },
//             {
//                 new: true
//             },
//     )

//     const options = {
//         httpOnly: true,
//         secure: true
//     }
//     return res
//         .status(200)
//         .clearCookie("accessToken", options)
//         .clearCookie("refreshToken", options)
//         .json({message: "you have been logout"})
// }
// }
// export const authController = new AuthController();
export { signUp,login,changedPassword,logout }