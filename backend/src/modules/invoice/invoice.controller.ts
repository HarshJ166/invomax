import { Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { InvoiceService, CreateInvoiceDto, UpdateInvoiceDto } from './invoice.service.js';
import { generateInvoicePDFBuffer } from './pdf-generator.js';

const invoiceService = new InvoiceService();

export async function createInvoice(req: AuthRequest, res: Response): Promise<void> {
  const data: CreateInvoiceDto = req.body;
  const invoice = await invoiceService.createInvoice(req.companyId!, data);
  res.status(201).json(invoice);
}

export async function getInvoices(req: AuthRequest, res: Response): Promise<void> {
  const result = await invoiceService.getInvoices(req.companyId!, {
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    status: req.query.status as string,
    clientId: req.query.clientId as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
  });
  res.json(result);
}

export async function getInvoiceById(req: AuthRequest, res: Response): Promise<void> {
  const invoice = await invoiceService.getInvoiceById(
    req.companyId!,
    req.params.id
  );
  res.json(invoice);
}

export async function updateInvoice(req: AuthRequest, res: Response): Promise<void> {
  const data: UpdateInvoiceDto = req.body;
  const invoice = await invoiceService.updateInvoice(
    req.companyId!,
    req.params.id,
    data
  );
  res.json(invoice);
}

export async function deleteInvoice(req: AuthRequest, res: Response): Promise<void> {
  await invoiceService.deleteInvoice(req.companyId!, req.params.id);
  res.status(204).send();
}

export async function downloadInvoicePDF(req: AuthRequest, res: Response): Promise<void> {
  const invoice = await invoiceService.getInvoiceById(
    req.companyId!,
    req.params.id
  );
  
  const pdfBuffer = await generateInvoicePDFBuffer(invoice);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNo}.pdf"`);
  res.send(pdfBuffer);
}
