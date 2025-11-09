import { prisma } from '../../shared/db/prisma.js';
import { createError } from '../../shared/middleware/error-handler.js';
import path from 'path';
import fs from 'fs';
import { config } from '../../shared/config/config.js';

export interface SettingsResponse {
  email: string;
  logoUrl: string | null;
}

export class SettingsService {
  async getSettings(userId: string, companyId: string): Promise<SettingsResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { logoUrl: true },
    });

    if (!company) {
      throw createError('Company not found', 404, 'COMPANY_NOT_FOUND');
    }

    return {
      email: user.email,
      logoUrl: company.logoUrl,
    };
  }

  async uploadLogo(companyId: string, filename: string): Promise<string> {
    const logoUrl = `${config.baseUrl}/uploads/logos/${filename}`;

    await prisma.company.update({
      where: { id: companyId },
      data: { logoUrl },
    });

    return logoUrl;
  }

  async deleteLogo(companyId: string): Promise<void> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { logoUrl: true },
    });

    if (company?.logoUrl) {
      const logoPath = company.logoUrl.replace(`${config.baseUrl}/uploads/logos/`, '');
      const uploadDir = path.isAbsolute(config.uploadDir) 
        ? config.uploadDir 
        : path.join(process.cwd(), config.uploadDir);
      const fullPath = path.join(uploadDir, 'logos', logoPath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }

      await prisma.company.update({
        where: { id: companyId },
        data: { logoUrl: null },
      });
    }
  }
}

