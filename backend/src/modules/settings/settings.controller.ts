import { Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { SettingsService } from './settings.service.js';
import { createError } from '../../shared/middleware/error-handler.js';

const settingsService = new SettingsService();

export async function getSettings(req: AuthRequest, res: Response): Promise<void> {
  const settings = await settingsService.getSettings(req.userId!, req.companyId!);
  res.json(settings);
}

export async function uploadLogo(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) {
    throw createError('No file uploaded', 400, 'NO_FILE');
  }

  const logoUrl = await settingsService.uploadLogo(req.companyId!, req.file.filename);
  res.json({ logoUrl });
}

export async function deleteLogo(req: AuthRequest, res: Response): Promise<void> {
  await settingsService.deleteLogo(req.companyId!);
  res.status(204).send();
}

