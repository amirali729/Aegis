import mongoose , {Schema,Document} from "mongoose";
import bcrypt from 'bcrypt'
import jwt, { SignOptions } from "jsonwebtoken";


export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    role: "user" | "admin";
    isVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
    refreshToken?: string;
    tokenVersion: number;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}
const userSchema: Schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "please provide the email too"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "password is required please enter your password"]
    },
    fullName: {
        type: String,
        trim: true
    },
    refreshToken: {
        type: String
    },
    tokenVersion: {
    type: Number,
    default: 0
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpiry: Date,


}, { timestamps: true })

userSchema.pre<IUser>("save", async function () {
    if (!this.isModified("password")) return 
    this.password = await bcrypt.hash(this.password, 10)

})
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"]
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    },
        process.env.ACCESS_REFRESH_SECRET as jwt.Secret,{
        expiresIn: process.env.ACCESS_REFRESH_EXPIRY as SignOptions["expiresIn"]
}
    )
}

export const User = mongoose.model<IUser>("User", userSchema)