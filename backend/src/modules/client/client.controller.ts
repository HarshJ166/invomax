import { Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { ClientService, CreateClientDto, UpdateClientDto } from './client.service.js';

const clientService = new ClientService();

export async function createClient(req: AuthRequest, res: Response): Promise<void> {
  const data: CreateClientDto = req.body;
  const client = await clientService.createClient(req.companyId!, data);
  res.status(201).json(client);
}

export async function getClients(req: AuthRequest, res: Response): Promise<void> {
  const clients = await clientService.getClients(req.companyId!);
  res.json(clients);
}

export async function getClientById(req: AuthRequest, res: Response): Promise<void> {
  const client = await clientService.getClientById(req.companyId!, req.params.id);
  res.json(client);
}

export async function updateClient(req: AuthRequest, res: Response): Promise<void> {
  const data: UpdateClientDto = req.body;
  const client = await clientService.updateClient(req.companyId!, req.params.id, data);
  res.json(client);
}

export async function deleteClient(req: AuthRequest, res: Response): Promise<void> {
  await clientService.deleteClient(req.companyId!, req.params.id);
  res.status(204).send();
}
