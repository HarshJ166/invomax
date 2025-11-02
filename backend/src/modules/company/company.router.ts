import { Router } from 'express';
import { z } from 'zod';
import { getCompany, updateCompany } from './company.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validation.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';

const router = Router();

router.use(authenticate);

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  gstin: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  settingsJson: z.record(z.unknown()).optional(),
});

router.get('/', asyncHandler(getCompany));
router.patch('/', validate(updateCompanySchema), asyncHandler(updateCompany));

export { router as companyRouter };
