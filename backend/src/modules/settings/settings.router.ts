import { Router } from 'express';
import { getSettings, uploadLogo, deleteLogo } from './settings.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';
import { uploadLogo as uploadLogoMiddleware } from '../../shared/middleware/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getSettings));
router.post('/logo', uploadLogoMiddleware.single('logo'), asyncHandler(uploadLogo));
router.delete('/logo', asyncHandler(deleteLogo));

export { router as settingsRouter };

