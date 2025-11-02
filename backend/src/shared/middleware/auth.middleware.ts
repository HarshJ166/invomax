import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { createError } from './error-handler.js';

export interface AuthRequest extends Request {
  userId?: string;
  companyId?: string;
  email?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      companyId: string;
      email: string;
    };

    req.userId = decoded.userId;
    req.companyId = decoded.companyId;
    req.email = decoded.email;

    next();
  } catch (err) {
    if (err instanceof Error && err.name === 'JsonWebTokenError') {
      throw createError('Invalid token', 401, 'INVALID_TOKEN');
    }
    throw err;
  }
}
