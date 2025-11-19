import {
  Company,
  Client,
  Item,
  Invoice,
  DealerPayment,
  Archive,
  DealerArchive,
} from "./types";

declare global {
  interface Window {
    electronAPI?: {
      db: {
        getPath: () => Promise<string>;
        companies: {
          getAll: () => Promise<{ success: boolean; data?: Company[]; error?: string }>;
          getPaginated: (limit: number, offset: number) => Promise<{ success: boolean; data?: Company[]; total?: number; error?: string }>;
          getCount: () => Promise<{ success: boolean; count?: number; error?: string }>;
          create: (company: Company | Partial<Company>) => Promise<{ success: boolean; error?: string }>;
          update: (id: string, company: Company | Partial<Company>) => Promise<{ success: boolean; error?: string }>;
          delete: (id: string) => Promise<{ success: boolean; error?: string }>;
          setAll: (companies: Company[]) => Promise<{ success: boolean; error?: string }>;
        };
        clients: {
          getAll: () => Promise<{ success: boolean; data?: Client[]; error?: string }>;
          getPaginated: (limit: number, offset: number) => Promise<{ success: boolean; data?: Client[]; total?: number; error?: string }>;
          getCount: () => Promise<{ success: boolean; count?: number; error?: string }>;
          create: (client: Client | Partial<Client>) => Promise<{ success: boolean; error?: string }>;
          update: (id: string, client: Client | Partial<Client>) => Promise<{ success: boolean; error?: string }>;
          delete: (id: string) => Promise<{ success: boolean; error?: string }>;
          setAll: (clients: Client[]) => Promise<{ success: boolean; error?: string }>;
        };
        items: {
          getAll: () => Promise<{ success: boolean; data?: Item[]; error?: string }>;
          getPaginated: (limit: number, offset: number) => Promise<{ success: boolean; data?: Item[]; total?: number; error?: string }>;
          getCount: () => Promise<{ success: boolean; count?: number; error?: string }>;
          create: (item: Item | Partial<Item>) => Promise<{ success: boolean; error?: string }>;
          update: (id: string, item: Item | Partial<Item>) => Promise<{ success: boolean; error?: string }>;
          delete: (id: string) => Promise<{ success: boolean; error?: string }>;
          setAll: (items: Item[]) => Promise<{ success: boolean; error?: string }>;
        };
        invoices: {
          getAll: () => Promise<{ success: boolean; data?: Invoice[]; error?: string }>;
          create: (invoice: Invoice | Partial<Invoice>) => Promise<{ success: boolean; error?: string }>;
          update: (id: string, invoice: Invoice | Partial<Invoice>) => Promise<{ success: boolean; error?: string }>;
          delete: (id: string) => Promise<{ success: boolean; error?: string }>;
          getById: (id: string) => Promise<{ success: boolean; data?: Invoice; error?: string }>;
          getLastByCompanyId: (companyId: string) => Promise<{ success: boolean; data?: Invoice; error?: string }>;
          archive: (invoiceId: string) => Promise<{ success: boolean; data?: Archive; error?: string }>;
        };
        archives: {
          getAll: () => Promise<{ success: boolean; data?: Archive[]; error?: string }>;
          restore: (archiveId: string) => Promise<{ success: boolean; data?: Invoice; error?: string }>;
        };
        dealers: {
          getAll: () => Promise<{ success: boolean; data?: DealerPayment[]; error?: string }>;
          getByCompanyId: (companyId: string) => Promise<{ success: boolean; data?: DealerPayment[]; error?: string }>;
          getByCompanyIdAndClientId: (companyId: string, clientId: string) => Promise<{ success: boolean; data?: DealerPayment[]; error?: string }>;
          getById: (id: string) => Promise<{ success: boolean; data?: DealerPayment; error?: string }>;
          create: (dealer: DealerPayment | Partial<DealerPayment>) => Promise<{ success: boolean; error?: string }>;
          update: (id: string, dealer: DealerPayment | Partial<DealerPayment>) => Promise<{ success: boolean; error?: string }>;
          delete: (id: string) => Promise<{ success: boolean; error?: string }>;
          archive: (dealerId: string) => Promise<{ success: boolean; data?: DealerArchive; error?: string }>;
        };
        dealerArchives: {
          getAll: () => Promise<{ success: boolean; data?: DealerArchive[]; error?: string }>;
          restore: (archiveId: string) => Promise<{ success: boolean; data?: DealerPayment; error?: string }>;
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

const handleGetAll = async <T>(
  apiCall: () => Promise<{ success: boolean; data?: T[]; error?: string }>,
  errorMessage: string
): Promise<T[]> => {
  try {
    const result = await apiCall();
    return result.success && result.data ? result.data : [];
  } catch (error) {
    console.error(errorMessage, error);
    return [];
  }
};

const handleGetPaginated = async <T>(
  apiCall: () => Promise<{ success: boolean; data?: T[]; total?: number; error?: string }>,
  errorMessage: string
): Promise<{ data: T[]; total: number }> => {
  try {
    const result = await apiCall();
    if (result.success && result.data) {
      return { data: result.data, total: result.total || 0 };
    }
    return { data: [], total: 0 };
  } catch (error) {
    console.error(errorMessage, error);
    return { data: [], total: 0 };
  }
};

const handleGetCount = async (
  apiCall: () => Promise<{ success: boolean; count?: number; error?: string }>,
  errorMessage: string
): Promise<number> => {
  try {
    const result = await apiCall();
    return result.success && result.count !== undefined ? result.count : 0;
  } catch (error) {
    console.error(errorMessage, error);
    return 0;
  }
};

const handleMutation = async (
  apiCall: () => Promise<{ success: boolean; error?: string }>,
  errorMessage: string
): Promise<{ success: boolean }> => {
  try {
    return await apiCall();
  } catch (error) {
    console.error(errorMessage, error);
    return { success: false };
  }
};

interface DbService {
  getPath: () => Promise<string>;
  companies: {
    getAll: () => Promise<Company[]>;
    getPaginated: (limit: number, offset: number) => Promise<{ data: Company[]; total: number }>;
    getCount: () => Promise<number>;
    create: (company: Company | Partial<Company>) => Promise<{ success: boolean }>;
    update: (id: string, company: Company | Partial<Company>) => Promise<{ success: boolean }>;
    delete: (id: string) => Promise<{ success: boolean }>;
    setAll: (companies: Company[]) => Promise<{ success: boolean }>;
  };
  clients: {
    getAll: () => Promise<Client[]>;
    getPaginated: (limit: number, offset: number) => Promise<{ data: Client[]; total: number }>;
    getCount: () => Promise<number>;
    create: (client: Client | Partial<Client>) => Promise<{ success: boolean }>;
    update: (id: string, client: Client | Partial<Client>) => Promise<{ success: boolean }>;
    delete: (id: string) => Promise<{ success: boolean }>;
    setAll: (clients: Client[]) => Promise<{ success: boolean }>;
  };
  items: {
    getAll: () => Promise<Item[]>;
    getPaginated: (limit: number, offset: number) => Promise<{ data: Item[]; total: number }>;
    getCount: () => Promise<number>;
    create: (item: Item | Partial<Item>) => Promise<{ success: boolean }>;
    update: (id: string, item: Item | Partial<Item>) => Promise<{ success: boolean }>;
    delete: (id: string) => Promise<{ success: boolean }>;
    setAll: (items: Item[]) => Promise<{ success: boolean }>;
  };
  invoices: {
    getAll: () => Promise<Invoice[]>;
    create: (invoice: Invoice | Partial<Invoice>) => Promise<{ success: boolean; error?: string }>;
    update: (id: string, invoice: Invoice | Partial<Invoice>) => Promise<{ success: boolean }>;
    delete: (id: string) => Promise<{ success: boolean }>;
    getById: (id: string) => Promise<{ success: boolean; data?: Invoice }>;
    getLastByCompanyId: (companyId: string) => Promise<{ success: boolean; data?: Invoice }>;
    archive: (invoiceId: string) => Promise<{ success: boolean; data?: Archive; error?: string }>;
  };
  archives: {
    getAll: () => Promise<Archive[]>;
    restore: (archiveId: string) => Promise<{ success: boolean; data?: Invoice; error?: string }>;
  };
  dealers: {
    getAll: () => Promise<DealerPayment[]>;
    getByCompanyId: (companyId: string) => Promise<DealerPayment[]>;
    getByCompanyIdAndClientId: (companyId: string, clientId: string) => Promise<DealerPayment[]>;
    getById: (id: string) => Promise<{ success: boolean; data?: DealerPayment }>;
    create: (dealer: DealerPayment | Partial<DealerPayment>) => Promise<{ success: boolean }>;
    update: (id: string, dealer: DealerPayment | Partial<DealerPayment>) => Promise<{ success: boolean }>;
    delete: (id: string) => Promise<{ success: boolean }>;
    archive: (dealerId: string) => Promise<{ success: boolean; data?: DealerArchive; error?: string }>;
  };
  dealerArchives: {
    getAll: () => Promise<DealerArchive[]>;
    restore: (archiveId: string) => Promise<{ success: boolean; data?: DealerPayment; error?: string }>;
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
    getAll: () => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve([]);
      return handleGetAll(() => api.db.companies.getAll(), "Error getting companies:");
    },
    getPaginated: (limit: number, offset: number) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ data: [], total: 0 });
      return handleGetPaginated(() => api.db.companies.getPaginated(limit, offset), "Error getting paginated companies:");
    },
    getCount: () => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve(0);
      return handleGetCount(() => api.db.companies.getCount(), "Error getting companies count:");
    },
    create: (company: Company | Partial<Company>) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.companies.create(company), "Error creating company:");
    },
    update: (id: string, company: Company | Partial<Company>) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.companies.update(id, company), "Error updating company:");
    },
    delete: (id: string) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.companies.delete(id), "Error deleting company:");
    },
    setAll: (companies: Company[]) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.companies.setAll(companies), "Error setting companies:");
    },
  },
  clients: {
    getAll: () => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve([]);
      return handleGetAll(() => api.db.clients.getAll(), "Error getting clients:");
    },
    getPaginated: (limit: number, offset: number) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ data: [], total: 0 });
      return handleGetPaginated(() => api.db.clients.getPaginated(limit, offset), "Error getting paginated clients:");
    },
    getCount: () => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve(0);
      return handleGetCount(() => api.db.clients.getCount(), "Error getting clients count:");
    },
    create: (client: Client | Partial<Client>) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.clients.create(client), "Error creating client:");
    },
    update: (id: string, client: Client | Partial<Client>) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.clients.update(id, client), "Error updating client:");
    },
    delete: (id: string) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.clients.delete(id), "Error deleting client:");
    },
    setAll: (clients: Client[]) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.clients.setAll(clients), "Error setting clients:");
    },
  },
  items: {
    getAll: () => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve([]);
      return handleGetAll(() => api.db.items.getAll(), "Error getting items:");
    },
    getPaginated: (limit: number, offset: number) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ data: [], total: 0 });
      return handleGetPaginated(() => api.db.items.getPaginated(limit, offset), "Error getting paginated items:");
    },
    getCount: () => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve(0);
      return handleGetCount(() => api.db.items.getCount(), "Error getting items count:");
    },
    create: (item: Item | Partial<Item>) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.items.create(item), "Error creating item:");
    },
    update: (id: string, item: Item | Partial<Item>) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.items.update(id, item), "Error updating item:");
    },
    delete: (id: string) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.items.delete(id), "Error deleting item:");
    },
    setAll: (items: Item[]) => {
      const api = getElectronAPI();
      if (!api) return Promise.resolve({ success: false });
      return handleMutation(() => api.db.items.setAll(items), "Error setting items:");
    },
  },
  invoices: {
    getAll: async () => {
      console.log("[db-service] invoices.getAll called");
      const api = getElectronAPI();
      if (!api) {
        console.error("[db-service] Electron API not available");
        return [];
      }
      try {
        const result = await api.db.invoices.getAll();
        const invoices = result.success && result.data ? result.data : [];
        console.log("[db-service] invoices.getAll result:", {
          success: result.success,
          count: invoices.length,
          invoiceIds: invoices.map((inv) => inv.id),
        });
        return invoices;
      } catch (error) {
        console.error("[db-service] Error getting invoices:", error);
        return [];
      }
    },
    create: async (invoice: Invoice | Partial<Invoice>) => {
      console.log("[db-service] invoices.create called");
      console.log("[db-service] Invoice data:", {
        id: "id" in invoice ? invoice.id : undefined,
        companyId: "companyId" in invoice ? invoice.companyId : undefined,
        clientId: "clientId" in invoice ? invoice.clientId : undefined,
        invoiceNumber: "invoiceNumber" in invoice ? invoice.invoiceNumber : undefined,
      });

      const api = getElectronAPI();
      if (!api) {
        console.error("[db-service] Electron API not available");
        return { success: false, error: "Electron API not available" };
      }

      try {
        console.log("[db-service] Calling Electron IPC: db:invoices:create");
        const result = await api.db.invoices.create(invoice);
        console.log("[db-service] IPC result:", result);

        if (result.success) {
          console.log("[db-service] Invoice created successfully via IPC");
          console.log("[db-service] Verifying invoice exists...");
          const verifyResult = await api.db.invoices.getAll();
          const invoiceId = "id" in invoice ? invoice.id : undefined;
          if (invoiceId && verifyResult.success && verifyResult.data) {
            const exists = verifyResult.data.some(
              (inv) => inv.id === invoiceId
            );
            console.log("[db-service] Verification:", {
              invoiceId,
              exists,
              totalInvoices: verifyResult.data.length,
            });
          }
        } else {
          console.error("[db-service] IPC returned failure:", result.error);
        }

        return result;
      } catch (error) {
        console.error("[db-service] Exception in invoices.create:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
      }
    },
    update: async (id: string, invoice: Invoice | Partial<Invoice>) => {
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
    archive: async (invoiceId: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.invoices.archive(invoiceId);
      } catch (error) {
        console.error("Error archiving invoice:", error);
        return { success: false };
      }
    },
  },
  archives: {
    getAll: async () => {
      const api = getElectronAPI();
      if (!api) return [];
      try {
        const result = await api.db.archives.getAll();
        return result.success && result.data ? result.data : [];
      } catch (error) {
        console.error("Error getting archives:", error);
        return [];
      }
    },
    restore: async (archiveId: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.archives.restore(archiveId);
      } catch (error) {
        console.error("Error restoring archive:", error);
        return { success: false };
      }
    },
  },
  dealers: {
    getAll: async () => {
      const api = getElectronAPI();
      if (!api) return [];
      try {
        const result = await api.db.dealers.getAll();
        return result.success && result.data ? result.data : [];
      } catch (error) {
        console.error("Error getting dealers:", error);
        return [];
      }
    },
    getByCompanyId: async (companyId: string) => {
      const api = getElectronAPI();
      if (!api) return [];
      try {
        const result = await api.db.dealers.getByCompanyId(companyId);
        return result.success && result.data ? result.data : [];
      } catch (error) {
        console.error("Error getting dealers by company:", error);
        return [];
      }
    },
    getByCompanyIdAndClientId: async (companyId: string, clientId: string) => {
      const api = getElectronAPI();
      if (!api) return [];
      try {
        const result = await api.db.dealers.getByCompanyIdAndClientId(companyId, clientId);
        return result.success && result.data ? result.data : [];
      } catch (error) {
        console.error("Error getting dealers by company and client:", error);
        return [];
      }
    },
    getById: async (id: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.dealers.getById(id);
      } catch (error) {
        console.error("Error getting dealer:", error);
        return { success: false };
      }
    },
    create: async (dealer: DealerPayment | Partial<DealerPayment>) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.dealers.create(dealer);
      } catch (error) {
        console.error("Error creating dealer:", error);
        return { success: false };
      }
    },
    update: async (id: string, dealer: DealerPayment | Partial<DealerPayment>) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.dealers.update(id, dealer);
      } catch (error) {
        console.error("Error updating dealer:", error);
        return { success: false };
      }
    },
    delete: async (id: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.dealers.delete(id);
      } catch (error) {
        console.error("Error deleting dealer:", error);
        return { success: false };
      }
    },
    archive: async (dealerId: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.dealers.archive(dealerId);
      } catch (error) {
        console.error("Error archiving dealer:", error);
        return { success: false };
      }
    },
  },
  dealerArchives: {
    getAll: async () => {
      const api = getElectronAPI();
      if (!api) return [];
      try {
        const result = await api.db.dealerArchives.getAll();
        return result.success && result.data ? result.data : [];
      } catch (error) {
        console.error("Error getting dealer archives:", error);
        return [];
      }
    },
    restore: async (archiveId: string) => {
      const api = getElectronAPI();
      if (!api) return { success: false };
      try {
        return await api.db.dealerArchives.restore(archiveId);
      } catch (error) {
        console.error("Error restoring dealer archive:", error);
        return { success: false };
      }
    },
  },
};
