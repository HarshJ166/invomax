import { PrismaClient } from '@prisma/client';
import { createError } from '../../shared/middleware/error-handler.js';

const prisma = new PrismaClient();

export interface UpdateCompanyDto {
  name?: string;
  gstin?: string;
  address?: string;
  logoUrl?: string;
  settingsJson?: Record<string, unknown>;
}

export class CompanyService {
  async getCompany(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          where: { deletedAt: null },
          select: { id: true, email: true, role: true },
        },
      },
    });

    if (!company) {
      throw createError('Company not found', 404, 'COMPANY_NOT_FOUND');
    }

    return company;
  }

  async updateCompany(companyId: string, data: UpdateCompanyDto) {
    return await prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.name,
        gstin: data.gstin,
        address: data.address,
        logoUrl: data.logoUrl,
        settingsJson: data.settingsJson,
      },
    });
  }
}
