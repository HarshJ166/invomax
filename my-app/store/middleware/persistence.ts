import { Middleware, AnyAction } from "@reduxjs/toolkit";
import { dbService } from "@/lib/db-service";
import { Company } from "@/lib/types";
import { Client } from "@/lib/types";
import { Item } from "@/lib/types";

type RootState = {
  companies: { companies: Company[] };
  clients: { clients: Client[] };
  items: { items: Item[] };
};

const debounce = <TArgs extends unknown[]>(
  func: (...args: TArgs) => Promise<void>,
  wait: number
): ((...args: TArgs) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: TArgs) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      void func(...args);
    }, wait);
  };
};

const saveCompanies = debounce(async (companies: Company[]) => {
  try {
    const companiesSnapshot = JSON.parse(JSON.stringify(companies));
    const result = await dbService.companies.setAll(companiesSnapshot);
    if (!result.success) {
      console.error("Failed to save companies");
    }
  } catch (error) {
    console.error("Failed to save companies:", error);
  }
}, 500);

const saveClients = debounce(async (clients: Client[]) => {
  try {
    const clientsSnapshot = JSON.parse(JSON.stringify(clients));
    const result = await dbService.clients.setAll(clientsSnapshot);
    if (!result.success) {
      console.error("Failed to save clients");
    }
  } catch (error) {
    console.error("Failed to save clients:", error);
  }
}, 500);

const saveItems = debounce(async (items: Item[]) => {
  try {
    const itemsSnapshot = JSON.parse(JSON.stringify(items));
    const result = await dbService.items.setAll(itemsSnapshot);
    if (!result.success) {
      console.error("Failed to save items");
    }
  } catch (error) {
    console.error("Failed to save items:", error);
  }
}, 500);

const isThunkAction = (actionType: string): boolean => {
  return actionType.includes("/pending") || 
         actionType.includes("/fulfilled") || 
         actionType.includes("/rejected");
};

const shouldSaveCompanies = (actionType: string, companies: Company[]): boolean => {
  if (isThunkAction(actionType)) return false;
  if (actionType === "companies/setCompanies") return false;
  if (companies.length === 0) return false;
  
  const saveActions = ["companies/addCompany", "companies/deleteCompany"];
  return saveActions.includes(actionType);
};

const shouldSaveClients = (actionType: string, clients: Client[]): boolean => {
  if (isThunkAction(actionType)) return false;
  if (actionType === "clients/setClients") return false;
  if (clients.length === 0) return false;
  
  const saveActions = ["clients/addClient", "clients/deleteClient"];
  return saveActions.includes(actionType);
};

const shouldSaveItems = (actionType: string, items: Item[]): boolean => {
  if (isThunkAction(actionType)) return false;
  if (actionType === "items/setItems") return false;
  if (items.length === 0) return false;
  
  const saveActions = ["items/addItem", "items/deleteItem"];
  return saveActions.includes(actionType);
};

export const persistenceMiddleware: Middleware<unknown, RootState> = (store) => (next) => (action: unknown) => {
  const result = next(action as AnyAction);
  const state = store.getState() as RootState;
  const typedAction = action as AnyAction;

  const actionType = (typedAction.type as string) || "";

  if (actionType.includes("invoice")) {
    console.log("[Persistence] Invoice-related action:", actionType);
  }

  if (shouldSaveCompanies(actionType, state.companies.companies)) {
    console.log("[Persistence] Saving companies:", {
      actionType,
      count: state.companies.companies.length,
      companyIds: state.companies.companies.map((c) => c.id),
    });
    saveCompanies(state.companies.companies);
  }

  if (shouldSaveClients(actionType, state.clients.clients)) {
    console.log("[Persistence] Saving clients:", {
      actionType,
      count: state.clients.clients.length,
    });
    saveClients(state.clients.clients);
  }

  if (shouldSaveItems(actionType, state.items.items)) {
    console.log("[Persistence] Saving items:", {
      actionType,
      count: state.items.items.length,
    });
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

