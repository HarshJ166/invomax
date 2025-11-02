import { Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { ItemService, CreateItemDto, UpdateItemDto } from './item.service.js';

const itemService = new ItemService();

export async function createItem(req: AuthRequest, res: Response): Promise<void> {
  const data: CreateItemDto = req.body;
  const item = await itemService.createItem(req.companyId!, data);
  res.status(201).json(item);
}

export async function getItems(req: AuthRequest, res: Response): Promise<void> {
  const items = await itemService.getItems(req.companyId!);
  res.json(items);
}

export async function getItemById(req: AuthRequest, res: Response): Promise<void> {
  const item = await itemService.getItemById(req.companyId!, req.params.id);
  res.json(item);
}

export async function updateItem(req: AuthRequest, res: Response): Promise<void> {
  const data: UpdateItemDto = req.body;
  const item = await itemService.updateItem(req.companyId!, req.params.id, data);
  res.json(item);
}

export async function deleteItem(req: AuthRequest, res: Response): Promise<void> {
  await itemService.deleteItem(req.companyId!, req.params.id);
  res.status(204).send();
}
