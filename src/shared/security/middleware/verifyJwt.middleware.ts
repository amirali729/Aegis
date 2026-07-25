import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../../modules/auth/models/user.model.js';
import type { JwtPayloadWithId } from '../../types/jwtPayload.js';

export const verifyjwt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken.replace('Bearer ', '');
    } else if (req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    let decoded: JwtPayloadWithId;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayloadWithId;
    } catch {
      return res.status(401).json({ message: 'Invalid or expired access token' });
    }

    const user = await User.findById(decoded._id).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        message: error?.message || 'There was an issue verifying the token',
      });
    }
    return res.status(500).json({
      message: error || 'There was an issue verifying the token',
    });
  }
};
