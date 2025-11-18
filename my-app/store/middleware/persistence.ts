import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { dbService } from "@/lib/db-service";
import { Company } from "@/lib/types";
import { Client } from "@/lib/types";
import { Item } from "@/lib/types";

const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const saveCompanies = debounce(async (companies: Company[]) => {
  try {
    const result = await dbService.companies.setAll(companies);
    if (!result.success) {
      console.error("Failed to save companies");
    }
  } catch (error) {
    console.error("Failed to save companies:", error);
  }
}, 500);

const saveClients = debounce(async (clients: Client[]) => {
  try {
    const result = await dbService.clients.setAll(clients);
    if (!result.success) {
      console.error("Failed to save clients");
    }
  } catch (error) {
    console.error("Failed to save clients:", error);
  }
}, 500);

const saveItems = debounce(async (items: Item[]) => {
  try {
    const result = await dbService.items.setAll(items);
    if (!result.success) {
      console.error("Failed to save items");
    }
  } catch (error) {
    console.error("Failed to save items:", error);
  }
}, 500);

export const persistenceMiddleware: Middleware<unknown, RootState> = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  if (action.type?.startsWith("companies/")) {
    saveCompanies(state.companies.companies);
  }

  if (action.type?.startsWith("clients/")) {
    saveClients(state.clients.clients);
  }

  if (action.type?.startsWith("items/")) {
    saveItems(state.items.items);
  }

  return result;
};

export const loadPersistedData = async (): Promise<{
  companies: Company[];
  clients: Client[];
  items: Item[];
}> => {
  try {
    const [companies, clients, items] = await Promise.all([
      dbService.companies.getAll(),
      dbService.clients.getAll(),
      dbService.items.getAll(),
    ]);

    return {
      companies: companies as Company[],
      clients: clients as Client[],
      items: items as Item[],
    };
  } catch (error) {
    console.error("Failed to load persisted data:", error);
    return {
      companies: [],
      clients: [],
      items: [],
    };
  }
};

