const getIpcRenderer = (): ElectronIpcRenderer | null => {
  if (typeof window !== 'undefined' && window.require) {
    try {
      return window.require('electron').ipcRenderer;
    } catch {
      return null;
    }
  }
  return null;
};

const ipcRenderer = getIpcRenderer();

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
}

export const dbService: DbService = {
  getPath: () => ipcRenderer?.invoke('db:getPath') as Promise<string> || Promise.resolve(''),
  companies: {
    getAll: () => ipcRenderer?.invoke('db:companies:getAll') || Promise.resolve([]),
    create: (company: unknown) => ipcRenderer?.invoke('db:companies:create', company) || Promise.resolve({ success: false }),
    update: (id: string, company: unknown) => ipcRenderer?.invoke('db:companies:update', id, company) || Promise.resolve({ success: false }),
    delete: (id: string) => ipcRenderer?.invoke('db:companies:delete', id) || Promise.resolve({ success: false }),
    setAll: (companies: unknown[]) => ipcRenderer?.invoke('db:companies:setAll', companies) || Promise.resolve({ success: false }),
  },
  clients: {
    getAll: () => ipcRenderer?.invoke('db:clients:getAll') || Promise.resolve([]),
    create: (client: unknown) => ipcRenderer?.invoke('db:clients:create', client) || Promise.resolve({ success: false }),
    update: (id: string, client: unknown) => ipcRenderer?.invoke('db:clients:update', id, client) || Promise.resolve({ success: false }),
    delete: (id: string) => ipcRenderer?.invoke('db:clients:delete', id) || Promise.resolve({ success: false }),
    setAll: (clients: unknown[]) => ipcRenderer?.invoke('db:clients:setAll', clients) || Promise.resolve({ success: false }),
  },
  items: {
    getAll: () => ipcRenderer?.invoke('db:items:getAll') || Promise.resolve([]),
    create: (item: unknown) => ipcRenderer?.invoke('db:items:create', item) || Promise.resolve({ success: false }),
    update: (id: string, item: unknown) => ipcRenderer?.invoke('db:items:update', id, item) || Promise.resolve({ success: false }),
    delete: (id: string) => ipcRenderer?.invoke('db:items:delete', id) || Promise.resolve({ success: false }),
    setAll: (items: unknown[]) => ipcRenderer?.invoke('db:items:setAll', items) || Promise.resolve({ success: false }),
  },
};

