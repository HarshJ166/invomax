import { Request, Response } from 'express';
import { AuthService, RegisterDto, LoginDto } from './auth.service.js';
import { createError } from '../../shared/middleware/error-handler.js';

const authService = new AuthService();

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const data: RegisterDto = req.body;
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error && 'statusCode' in err) {
      throw err;
    }
    throw createError('Registration failed', 500);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const data: LoginDto = req.body;
    const result = await authService.login(data);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && 'statusCode' in err) {
      throw err;
    }
    throw createError('Login failed', 500);
  }
}
