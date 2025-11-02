import { Router } from 'express';
import { z } from 'zod';
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from './client.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validation.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';

const router = Router();

router.use(authenticate);

const clientSchema = z.object({
  name: z.string().min(1),
  gstin: z.string().optional().nullable(),
  billingAddress: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
});

router.post('/', validate(clientSchema), asyncHandler(createClient));
router.get('/', asyncHandler(getClients));
router.get('/:id', asyncHandler(getClientById));
router.patch('/:id', validate(clientSchema.partial()), asyncHandler(updateClient));
router.delete('/:id', asyncHandler(deleteClient));

export { router as clientRouter };
