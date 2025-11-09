import { prisma } from '../../shared/db/prisma.js';
import { TaxCalculator } from '../../shared/tax-calculator/tax-calculator.js';
import { createError } from '../../shared/middleware/error-handler.js';

export interface CreateInvoiceDto {
  clientId: string;
  templateId?: string;
  date: string;
  items: Array<{
    itemId?: string;
    name: string;
    hsnCode?: string;
    batch?: string;
    quantity: number;
    rate: number;
    taxRate: number;
  }>;
  notes?: string;
  eWayBillNo?: string;
  deliveryNote?: string;
  modeTermsOfPayment?: string;
  supplierRef?: string;
  otherReferences?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  despatchDocumentNo?: string;
  deliveryNoteDate?: string;
  despatchedThrough?: string;
  destination?: string;
  termsOfDelivery?: string;
}

export interface UpdateInvoiceDto {
  clientId?: string;
  templateId?: string;
  date?: string;
  status?: string;
  items?: CreateInvoiceDto['items'];
  notes?: string;
  eWayBillNo?: string;
  deliveryNote?: string;
  modeTermsOfPayment?: string;
  supplierRef?: string;
  otherReferences?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  despatchDocumentNo?: string;
  deliveryNoteDate?: string;
  despatchedThrough?: string;
  destination?: string;
  termsOfDelivery?: string;
}

export class InvoiceService {
  async createInvoice(companyId: string, data: CreateInvoiceDto) {
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, companyId, deletedAt: null },
      include: { company: true },
    });

    if (!client) {
      throw createError('Client not found', 404, 'CLIENT_NOT_FOUND');
    }

    const sequence = await prisma.invoiceSequence.findUnique({
      where: { companyId },
    });

    if (!sequence) {
      throw createError('Invoice sequence not found', 500);
    }

    const invoiceNo = `${sequence.prefix}-${sequence.nextNumber.toString().padStart(6, '0')}`;

    const taxBreakdown = TaxCalculator.calculateInvoiceTax(
      data.items,
      client.state || '',
      client.company.state || ''
    );

    const result = await prisma.$transaction(async (tx) => {
      await tx.invoiceSequence.update({
        where: { companyId },
        data: { nextNumber: { increment: 1 } },
      });

      const invoice = await tx.invoice.create({
        data: {
          companyId,
          clientId: data.clientId,
          templateId: data.templateId,
          invoiceNo,
          date: new Date(data.date),
          status: 'draft',
          totalAmount: taxBreakdown.total,
          taxAmount: taxBreakdown.cgst + taxBreakdown.sgst + taxBreakdown.igst,
          notes: data.notes,
          eWayBillNo: data.eWayBillNo,
          deliveryNote: data.deliveryNote,
          modeTermsOfPayment: data.modeTermsOfPayment,
          supplierRef: data.supplierRef,
          otherReferences: data.otherReferences,
          buyerOrderNo: data.buyerOrderNo,
          buyerOrderDate: data.buyerOrderDate ? new Date(data.buyerOrderDate) : null,
          despatchDocumentNo: data.despatchDocumentNo,
          deliveryNoteDate: data.deliveryNoteDate ? new Date(data.deliveryNoteDate) : null,
          despatchedThrough: data.despatchedThrough,
          destination: data.destination,
          termsOfDelivery: data.termsOfDelivery,
          items: {
            create: data.items.map((item) => ({
              itemId: item.itemId,
              name: item.name,
              hsnCode: item.hsnCode,
              batch: item.batch,
              quantity: item.quantity,
              rate: item.rate,
              taxRate: item.taxRate,
              amount: item.quantity * item.rate,
              taxAmount: (item.quantity * item.rate * item.taxRate) / 100,
            })),
          },
        },
        include: {
          client: true,
          items: { include: { item: true } },
          template: true,
          company: true,
        },
      });

      return invoice;
    });

    return result;
  }

  async getInvoices(
    companyId: string,
    filters: {
      page?: number;
      limit?: number;
      status?: string;
      clientId?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: {
      companyId: string;
      deletedAt: null;
      status?: string;
      clientId?: string;
      date?: { gte?: Date; lte?: Date };
    } = {
      companyId,
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: true,
          items: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInvoiceById(companyId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId,
        deletedAt: null,
      },
      include: {
        client: true,
        items: { include: { item: true } },
        template: true,
        company: true,
      },
    });

    if (!invoice) {
      throw createError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
    }

    return invoice;
  }

  async updateInvoice(
    companyId: string,
    invoiceId: string,
    data: UpdateInvoiceDto
  ) {
    const invoice = await this.getInvoiceById(companyId, invoiceId);

    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      throw createError(
        'Cannot update paid or cancelled invoice',
        400,
        'INVALID_STATUS'
      );
    }

    let updateData: {
      clientId?: string;
      templateId?: string;
      date?: Date;
      status?: string;
      totalAmount?: number;
      taxAmount?: number;
      notes?: string;
      eWayBillNo?: string;
      deliveryNote?: string;
      modeTermsOfPayment?: string;
      supplierRef?: string;
      otherReferences?: string;
      buyerOrderNo?: string;
      buyerOrderDate?: Date | null;
      despatchDocumentNo?: string;
      deliveryNoteDate?: Date | null;
      despatchedThrough?: string;
      destination?: string;
      termsOfDelivery?: string;
    } = {};

    if (data.status) {
      updateData.status = data.status;
    }

    if (data.date) {
      updateData.date = new Date(data.date);
    }

    if (data.clientId || data.items) {
      const clientId = data.clientId || invoice.clientId;
      const client = await prisma.client.findFirst({
        where: { id: clientId, companyId, deletedAt: null },
        include: { company: true },
      });

      if (!client) {
        throw createError('Client not found', 404, 'CLIENT_NOT_FOUND');
      }

      const items = data.items || invoice.items.map((item) => ({
        name: item.name,
        hsnCode: item.hsnCode || undefined,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        taxRate: Number(item.taxRate),
      }));

      const taxBreakdown = TaxCalculator.calculateInvoiceTax(
        items,
        client.state || '',
        client.company.state || ''
      );

      updateData.clientId = clientId;
      updateData.totalAmount = taxBreakdown.total;
      updateData.taxAmount =
        taxBreakdown.cgst + taxBreakdown.sgst + taxBreakdown.igst;
    }

    if (data.templateId !== undefined) {
      updateData.templateId = data.templateId;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    if (data.eWayBillNo !== undefined) {
      updateData.eWayBillNo = data.eWayBillNo;
    }
    if (data.deliveryNote !== undefined) {
      updateData.deliveryNote = data.deliveryNote;
    }
    if (data.modeTermsOfPayment !== undefined) {
      updateData.modeTermsOfPayment = data.modeTermsOfPayment;
    }
    if (data.supplierRef !== undefined) {
      updateData.supplierRef = data.supplierRef;
    }
    if (data.otherReferences !== undefined) {
      updateData.otherReferences = data.otherReferences;
    }
    if (data.buyerOrderNo !== undefined) {
      updateData.buyerOrderNo = data.buyerOrderNo;
    }
    if (data.buyerOrderDate !== undefined) {
      updateData.buyerOrderDate = data.buyerOrderDate ? new Date(data.buyerOrderDate) : null;
    }
    if (data.despatchDocumentNo !== undefined) {
      updateData.despatchDocumentNo = data.despatchDocumentNo;
    }
    if (data.deliveryNoteDate !== undefined) {
      updateData.deliveryNoteDate = data.deliveryNoteDate ? new Date(data.deliveryNoteDate) : null;
    }
    if (data.despatchedThrough !== undefined) {
      updateData.despatchedThrough = data.despatchedThrough;
    }
    if (data.destination !== undefined) {
      updateData.destination = data.destination;
    }
    if (data.termsOfDelivery !== undefined) {
      updateData.termsOfDelivery = data.termsOfDelivery;
    }

    const result = await prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId },
        });

        await tx.invoiceItem.createMany({
          data: data.items.map((item) => ({
            invoiceId,
            itemId: item.itemId,
            name: item.name,
            hsnCode: item.hsnCode,
            batch: item.batch,
            quantity: item.quantity,
            rate: item.rate,
            taxRate: item.taxRate,
            amount: item.quantity * item.rate,
            taxAmount: (item.quantity * item.rate * item.taxRate) / 100,
          })),
        });
      }

      return await tx.invoice.update({
        where: { id: invoiceId },
        data: updateData,
        include: {
          client: true,
          items: { include: { item: true } },
          template: true,
          company: true,
        },
      });
    });

    return result;
  }

  async deleteInvoice(companyId: string, invoiceId: string) {
    const invoice = await this.getInvoiceById(companyId, invoiceId);

    if (invoice.status === 'paid') {
      throw createError('Cannot delete paid invoice', 400, 'INVALID_STATUS');
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { deletedAt: new Date() },
    });
  }
}
