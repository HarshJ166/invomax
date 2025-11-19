declare global {
  interface Window {
    electronAPI?: {
      db: {
        getPath: () => Promise<string>;
        companies: {
          getAll: () => Promise<{ success: boolean; data?: unknown[]; error?: string }>;
          create: (company: unknown) => Promise<{ success: boolean; error?: string }>;
          update: (id: string, company: unknown) => Promise<{ success: boolean; error?: string }>;
          delete: (id: string) => Promise<{ success: boolean; error?: string }>;
          setAll: (companies: unknown[]) => Promise<{ success: boolean; error?: string }>;
        };
        clients: {
          getAll: () => Promise<{ success: boolean; data?: unknown[]; error?: string }>;
          create: (client: unknown) => Promise<{ success: boolean; error?: string }>;
          update: (id: string, client: unknown) => Promise<{ success: boolean; error?: string }>;
          delete: (id: string) => Promise<{ success: boolean; error?: string }>;
          setAll: (clients: unknown[]) => Promise<{ success: boolean; error?: string }>;
        };
        items: {
          getAll: () => Promise<{ success: boolean; data?: unknown[]; error?: string }>;
          create: (item: unknown) => Promise<{ success: boolean; error?: string }>;
          update: (id: string, item: unknown) => Promise<{ success: boolean; error?: string }>;
          delete: (id: string) => Promise<{ success: boolean; error?: string }>;
          setAll: (items: unknown[]) => Promise<{ success: boolean; error?: string }>;
        };
        invoices: {
          getAll: () => Promise<{ success: boolean; data?: unknown[]; error?: string }>;
          create: (invoice: unknown) => Promise<{ success: boolean; error?: string }>;
          update: (id: string, invoice: unknown) => Promise<{ success: boolean; error?: string }>;
          delete: (id: string) => Promise<{ success: boolean; error?: string }>;
          getById: (id: string) => Promise<{ success: boolean; data?: unknown; error?: string }>;
          getLastByCompanyId: (companyId: string) => Promise<{ success: boolean; data?: unknown; error?: string }>;
        };
      };
    };
  }
}

const getElectronAPI = () => {
  if (typeof window !== "undefined" && window.electronAPI) {
    return window.electronAPI;
  }
  return null;
};

interface DbService {
  getPath: () => Promise<string>;
  companies: {
    getAll: () => Promise<unknown[]>;
    create: (company: unknown) => Promise<{ success: boolean }>;
    update: (id: string, company: unknown) => Promise<{ success: boolean }>;
    delete: (id: string) => Promise<{ success: boolean }>;
    setAll: (companies: unknown[]) => Promise<{ success: boolean }>;
  };
  clients: {
    getAll: () => Promise<unknown[]>;
    create: (client: unknown) => Promise<{ success: boolean }>;
    update: (id: string, client: unknown) => Promise<{ success: boolean }>;
    delete: (id: string) => Promise<{ success: boolean }>;
    setAll: (clients: unknown[]) => Promise<{ success: boolean }>;
  };
  items: {
    getAll: () => Promise<unknown[]>;
    create: (item: unknown) => Promise<{ success: boolean }>;
    update: (id: string, item: unknown) => Promise<{ success: boolean }>;
    delete: (id: string) => Promise<{ success: boolean }>;
    setAll: (items: unknown[]) => Promise<{ success: boolean }>;
  };
  invoices: {
    getAll: () => Promise<unknown[]>;
    create: (invoice: unknown) => Promise<{ success: boolean }>;
    update: (id: string, invoice: unknown) => Promise<{ success: boolean }>;
    delete: (id: string) => Promise<{ success: boolean }>;
    getById: (id: string) => Promise<{ success: boolean; data?: unknown }>;
    getLastByCompanyId: (companyId: string) => Promise<{ success: boolean; data?: unknown }>;
  };
}

export const dbService: DbService = {
  getPath: async () => {
    const api = getElectronAPI();
    if (!api) return "";
    try {
      return await api.db.getPath();
    } catch (error) {
      console.error("Error getting database path:", error);
      return "";
    }
  },
  companies: {
    getAll: async () => {
      const api = getElectronAPI();
      if (!api) return [];
      try {
        const result = await api.db.companies.getAll();
        return result.success && result.data ? result.data : [];
      } catch (error) {
        console.error("Error getting companies:", error);
        return [];
      }
    },
    create: async (company: unknown) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.companies.create(company);
      } catch (error) {
        console.error("Error creating company:", error);
        return { success: false };
      }
    },
    update: async (id: string, company: unknown) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.companies.update(id, company);
      } catch (error) {
        console.error("Error updating company:", error);
        return { success: false };
      }
    },
    delete: async (id: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.companies.delete(id);
      } catch (error) {
        console.error("Error deleting company:", error);
        return { success: false };
      }
    },
    setAll: async (companies: unknown[]) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.companies.setAll(companies);
      } catch (error) {
        console.error("Error setting companies:", error);
        return { success: false };
      }
    },
  },
  clients: {
    getAll: async () => {
      const api = getElectronAPI();
      if (!api) return [];
      try {
        const result = await api.db.clients.getAll();
        return result.success && result.data ? result.data : [];
      } catch (error) {
        console.error("Error getting clients:", error);
        return [];
      }
    },
    create: async (client: unknown) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.clients.create(client);
      } catch (error) {
        console.error("Error creating client:", error);
        return { success: false };
      }
    },
    update: async (id: string, client: unknown) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.clients.update(id, client);
      } catch (error) {
        console.error("Error updating client:", error);
        return { success: false };
      }
    },
    delete: async (id: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.clients.delete(id);
      } catch (error) {
        console.error("Error deleting client:", error);
        return { success: false };
      }
    },
    setAll: async (clients: unknown[]) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.clients.setAll(clients);
      } catch (error) {
        console.error("Error setting clients:", error);
        return { success: false };
      }
    },
  },
  items: {
    getAll: async () => {
      const api = getElectronAPI();
      if (!api) return [];
      try {
        const result = await api.db.items.getAll();
        return result.success && result.data ? result.data : [];
      } catch (error) {
        console.error("Error getting items:", error);
        return [];
      }
    },
    create: async (item: unknown) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.items.create(item);
      } catch (error) {
        console.error("Error creating item:", error);
        return { success: false };
      }
    },
    update: async (id: string, item: unknown) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.items.update(id, item);
      } catch (error) {
        console.error("Error updating item:", error);
        return { success: false };
      }
    },
    delete: async (id: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.items.delete(id);
      } catch (error) {
        console.error("Error deleting item:", error);
        return { success: false };
      }
    },
    setAll: async (items: unknown[]) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.items.setAll(items);
      } catch (error) {
        console.error("Error setting items:", error);
        return { success: false };
      }
    },
  },
  invoices: {
    getAll: async () => {
      const api = getElectronAPI();
      if (!api) return [];
      try {
        const result = await api.db.invoices.getAll();
        return result.success && result.data ? result.data : [];
      } catch (error) {
        console.error("Error getting invoices:", error);
        return [];
      }
    },
    create: async (invoice: unknown) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.invoices.create(invoice);
      } catch (error) {
        console.error("Error creating invoice:", error);
        return { success: false };
      }
    },
    update: async (id: string, invoice: unknown) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.invoices.update(id, invoice);
      } catch (error) {
        console.error("Error updating invoice:", error);
        return { success: false };
      }
    },
    delete: async (id: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.invoices.delete(id);
      } catch (error) {
        console.error("Error deleting invoice:", error);
        return { success: false };
      }
    },
    getById: async (id: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.invoices.getById(id);
      } catch (error) {
        console.error("Error getting invoice:", error);
        return { success: false };
      }
    },
    getLastByCompanyId: async (companyId: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.invoices.getLastByCompanyId(companyId);
      } catch (error) {
        console.error("Error getting last invoice:", error);
        return { success: false };
      }
    },
  },
};
