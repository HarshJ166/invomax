import { prisma } from '../../shared/db/prisma.js';
import { createError } from '../../shared/middleware/error-handler.js';

export interface UpdateCompanyDto {
  name?: string;
  gstin?: string;
  address?: string;
  email?: string;
  state?: string;
  stateCode?: string;
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
        email: data.email,
        state: data.state,
        stateCode: data.stateCode,
        logoUrl: data.logoUrl,
        settingsJson: data.settingsJson,
      },
    });
  }
}
