import { Router } from 'express';
import { z } from 'zod';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
} from './invoice.controller.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validation.middleware.js';
import { asyncHandler } from '../../shared/middleware/async-handler.js';

const router = Router();

router.use(authenticate);

const createInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  date: z.string().date(),
  items: z.array(
    z.object({
      itemId: z.string().uuid().optional(),
      name: z.string().min(1),
      hsnCode: z.string().optional(),
      batch: z.string().optional(),
      quantity: z.number().positive(),
      rate: z.number().positive(),
      taxRate: z.number().min(0).max(100),
    })
  ).min(1),
  notes: z.string().optional(),
  eWayBillNo: z.string().optional(),
  deliveryNote: z.string().optional(),
  modeTermsOfPayment: z.string().optional(),
  supplierRef: z.string().optional(),
  otherReferences: z.string().optional(),
  buyerOrderNo: z.string().optional(),
  buyerOrderDate: z.union([z.string().date(), z.literal('')]).optional().transform((val) => val === '' ? undefined : val),
  despatchDocumentNo: z.string().optional(),
  deliveryNoteDate: z.union([z.string().date(), z.literal('')]).optional().transform((val) => val === '' ? undefined : val),
  despatchedThrough: z.string().optional(),
  destination: z.string().optional(),
  termsOfDelivery: z.string().optional(),
});

const updateInvoiceSchema = z.object({
  clientId: z.string().uuid().optional(),
  templateId: z.string().uuid().optional().nullable(),
  date: z.string().date().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']).optional(),
  items: z.array(
    z.object({
      itemId: z.string().uuid().optional(),
      name: z.string().min(1),
      hsnCode: z.string().optional(),
      batch: z.string().optional(),
      quantity: z.number().positive(),
      rate: z.number().positive(),
      taxRate: z.number().min(0).max(100),
    })
  ).optional(),
  notes: z.string().optional(),
  eWayBillNo: z.string().optional(),
  deliveryNote: z.string().optional(),
  modeTermsOfPayment: z.string().optional(),
  supplierRef: z.string().optional(),
  otherReferences: z.string().optional(),
  buyerOrderNo: z.string().optional(),
  buyerOrderDate: z.union([z.string().date(), z.literal('')]).optional().transform((val) => val === '' ? undefined : val),
  despatchDocumentNo: z.string().optional(),
  deliveryNoteDate: z.union([z.string().date(), z.literal('')]).optional().transform((val) => val === '' ? undefined : val),
  despatchedThrough: z.string().optional(),
  destination: z.string().optional(),
  termsOfDelivery: z.string().optional(),
});

router.post('/', validate(createInvoiceSchema), asyncHandler(createInvoice));
router.get('/', asyncHandler(getInvoices));
router.get('/:id', asyncHandler(getInvoiceById));
router.get('/:id/pdf', asyncHandler(downloadInvoicePDF));
router.patch('/:id', validate(updateInvoiceSchema), asyncHandler(updateInvoice));
router.delete('/:id', asyncHandler(deleteInvoice));

export { router as invoiceRouter };
