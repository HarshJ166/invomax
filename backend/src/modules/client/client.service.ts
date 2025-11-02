import { PrismaClient } from '@prisma/client';
import { createError } from '../../shared/middleware/error-handler.js';

const prisma = new PrismaClient();

export interface CreateClientDto {
  name: string;
  gstin?: string;
  billingAddress?: string;
  shippingAddress?: string;
  state?: string;
}

export interface UpdateClientDto {
  name?: string;
  gstin?: string;
  billingAddress?: string;
  shippingAddress?: string;
  state?: string;
}

export class ClientService {
  async createClient(companyId: string, data: CreateClientDto) {
    return await prisma.client.create({
      data: {
        companyId,
        ...data,
      },
    });
  }

  async getClients(companyId: string) {
    return await prisma.client.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getClientById(companyId: string, clientId: string) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId,
        deletedAt: null,
      },
    });

    if (!client) {
      throw createError('Client not found', 404, 'CLIENT_NOT_FOUND');
    }

    return client;
  }

  async updateClient(companyId: string, clientId: string, data: UpdateClientDto) {
    await this.getClientById(companyId, clientId);

    return await prisma.client.update({
      where: { id: clientId },
      data,
    });
  }

  async deleteClient(companyId: string, clientId: string) {
    await this.getClientById(companyId, clientId);

    await prisma.client.update({
      where: { id: clientId },
      data: { deletedAt: new Date() },
    });
  }
}
