import { Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { CompanyService, UpdateCompanyDto } from './company.service.js';

const companyService = new CompanyService();

export async function getCompany(req: AuthRequest, res: Response): Promise<void> {
  const company = await companyService.getCompany(req.companyId!);
  res.json(company);
}

export async function updateCompany(req: AuthRequest, res: Response): Promise<void> {
  const data: UpdateCompanyDto = req.body;
  const company = await companyService.updateCompany(req.companyId!, data);
  res.json(company);
}
