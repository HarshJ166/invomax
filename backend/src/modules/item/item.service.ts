import { PrismaClient } from '@prisma/client';
import { createError } from '../../shared/middleware/error-handler.js';

const prisma = new PrismaClient();

export interface CreateItemDto {
  name: string;
  hsnCode?: string;
  unit: string;
  basePrice: number;
  taxRate: number;
}

export interface UpdateItemDto {
  name?: string;
  hsnCode?: string;
  unit?: string;
  basePrice?: number;
  taxRate?: number;
}

export class ItemService {
  async createItem(companyId: string, data: CreateItemDto) {
    return await prisma.item.create({
      data: {
        companyId,
        ...data,
        basePrice: data.basePrice,
        taxRate: data.taxRate,
      },
    });
  }

  async getItems(companyId: string) {
    return await prisma.item.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getItemById(companyId: string, itemId: string) {
    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        companyId,
        deletedAt: null,
      },
    });

    if (!item) {
      throw createError('Item not found', 404, 'ITEM_NOT_FOUND');
    }

    return item;
  }

  async updateItem(companyId: string, itemId: string, data: UpdateItemDto) {
    await this.getItemById(companyId, itemId);

    return await prisma.item.update({
      where: { id: itemId },
      data: {
        ...data,
        basePrice: data.basePrice,
        taxRate: data.taxRate,
      },
    });
  }

  async deleteItem(companyId: string, itemId: string) {
    await this.getItemById(companyId, itemId);

    await prisma.item.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });
  }
}
