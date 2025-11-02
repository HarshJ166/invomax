import { Router } from 'express';
import { z } from 'zod';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from './item.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validation.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';

const router = Router();

router.use(authenticate);

const itemSchema = z.object({
  name: z.string().min(1),
  hsnCode: z.string().optional().nullable(),
  unit: z.string().min(1),
  basePrice: z.number().positive(),
  taxRate: z.number().min(0).max(100),
});

router.post('/', validate(itemSchema), asyncHandler(createItem));
router.get('/', asyncHandler(getItems));
router.get('/:id', asyncHandler(getItemById));
router.patch('/:id', validate(itemSchema.partial()), asyncHandler(updateItem));
router.delete('/:id', asyncHandler(deleteItem));

export { router as itemRouter };
