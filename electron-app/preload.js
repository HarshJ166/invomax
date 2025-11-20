const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  db: {
    getPath: () => ipcRenderer.invoke("db:getPath"),
    companies: {
      getAll: () => ipcRenderer.invoke("db:companies:getAll"),
      getPaginated: (limit, offset) => ipcRenderer.invoke("db:companies:getPaginated", limit, offset),
      getCount: () => ipcRenderer.invoke("db:companies:getCount"),
      create: (company) => ipcRenderer.invoke("db:companies:create", company),
      update: (id, company) => ipcRenderer.invoke("db:companies:update", id, company),
      delete: (id) => ipcRenderer.invoke("db:companies:delete", id),
      setAll: (companies) => ipcRenderer.invoke("db:companies:setAll", companies),
    },
    clients: {
      getAll: () => ipcRenderer.invoke("db:clients:getAll"),
      getPaginated: (limit, offset) => ipcRenderer.invoke("db:clients:getPaginated", limit, offset),
      getCount: () => ipcRenderer.invoke("db:clients:getCount"),
      create: (client) => ipcRenderer.invoke("db:clients:create", client),
      update: (id, client) => ipcRenderer.invoke("db:clients:update", id, client),
      delete: (id) => ipcRenderer.invoke("db:clients:delete", id),
      setAll: (clients) => ipcRenderer.invoke("db:clients:setAll", clients),
    },
    items: {
      getAll: () => ipcRenderer.invoke("db:items:getAll"),
      getPaginated: (limit, offset) => ipcRenderer.invoke("db:items:getPaginated", limit, offset),
      getCount: () => ipcRenderer.invoke("db:items:getCount"),
      create: (item) => ipcRenderer.invoke("db:items:create", item),
      update: (id, item) => ipcRenderer.invoke("db:items:update", id, item),
      delete: (id) => ipcRenderer.invoke("db:items:delete", id),
      setAll: (items) => ipcRenderer.invoke("db:items:setAll", items),
    },
    invoices: {
      getAll: () => ipcRenderer.invoke("db:invoices:getAll"),
      create: (invoice) => ipcRenderer.invoke("db:invoices:create", invoice),
      update: (id, invoice) => ipcRenderer.invoke("db:invoices:update", id, invoice),
      delete: (id) => ipcRenderer.invoke("db:invoices:delete", id),
      getById: (id) => ipcRenderer.invoke("db:invoices:getById", id),
      getLastByCompanyId: (companyId) => ipcRenderer.invoke("db:invoices:getLastByCompanyId", companyId),
      archive: (invoiceId) => ipcRenderer.invoke("db:invoices:archive", invoiceId),
    },
    archives: {
      getAll: () => ipcRenderer.invoke("db:archives:getAll"),
      restore: (archiveId) => ipcRenderer.invoke("db:archives:restore", archiveId),
    },
    dealers: {
      getAll: () => ipcRenderer.invoke("db:dealers:getAll"),
      getByCompanyId: (companyId) => ipcRenderer.invoke("db:dealers:getByCompanyId", companyId),
      getByCompanyIdAndClientId: (companyId, clientId) => ipcRenderer.invoke("db:dealers:getByCompanyIdAndClientId", companyId, clientId),
      getById: (id) => ipcRenderer.invoke("db:dealers:getById", id),
      create: (dealer) => ipcRenderer.invoke("db:dealers:create", dealer),
      update: (id, dealer) => ipcRenderer.invoke("db:dealers:update", id, dealer),
      delete: (id) => ipcRenderer.invoke("db:dealers:delete", id),
      archive: (dealerId) => ipcRenderer.invoke("db:dealers:archive", dealerId),
    },
    dealerArchives: {
      getAll: () => ipcRenderer.invoke("db:dealerArchives:getAll"),
      restore: (archiveId) => ipcRenderer.invoke("db:dealerArchives:restore", archiveId),
    },
    quotations: {
      getAll: () => ipcRenderer.invoke("db:quotations:getAll"),
      getById: (id) => ipcRenderer.invoke("db:quotations:getById", id),
      create: (quotation) => ipcRenderer.invoke("db:quotations:create", quotation),
      update: (id, quotation) => ipcRenderer.invoke("db:quotations:update", id, quotation),
      delete: (id) => ipcRenderer.invoke("db:quotations:delete", id),
      getByQuotationId: (quotationId) => ipcRenderer.invoke("db:quotations:getByQuotationId", quotationId),
    },
  },
});

