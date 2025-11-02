import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../../shared/config/config.js';
import { createError } from '../../shared/middleware/error-handler.js';

const prisma = new PrismaClient();

export interface RegisterDto {
  email: string;
  password: string;
  companyName: string;
  gstin?: string;
  address?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    companyId: string;
  };
}

export class AuthService {
  async register(data: RegisterDto): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw createError('Email already registered', 400, 'EMAIL_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          gstin: data.gstin,
          address: data.address,
          settingsJson: {},
        },
      });

      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: 'owner',
          companyId: company.id,
        },
      });

      await tx.invoiceSequence.create({
        data: {
          companyId: company.id,
          prefix: 'INV',
          nextNumber: 1,
        },
      });

      return { user, company };
    });

    const token = this.generateToken(
      result.user.id,
      result.company.id,
      result.user.email
    );

    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        companyId: result.company.id,
      },
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { company: true },
    });

    if (!user || user.deletedAt) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const token = this.generateToken(user.id, user.companyId, user.email);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  private generateToken(userId: string, companyId: string, email: string): string {
    return jwt.sign(
      { userId, companyId, email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }
}
