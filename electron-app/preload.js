const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  db: {
    getPath: () => ipcRenderer.invoke("db:getPath"),
    companies: {
      getAll: () => ipcRenderer.invoke("db:companies:getAll"),
      create: (company) => ipcRenderer.invoke("db:companies:create", company),
      update: (id, company) => ipcRenderer.invoke("db:companies:update", id, company),
      delete: (id) => ipcRenderer.invoke("db:companies:delete", id),
      setAll: (companies) => ipcRenderer.invoke("db:companies:setAll", companies),
    },
    clients: {
      getAll: () => ipcRenderer.invoke("db:clients:getAll"),
      create: (client) => ipcRenderer.invoke("db:clients:create", client),
      update: (id, client) => ipcRenderer.invoke("db:clients:update", id, client),
      delete: (id) => ipcRenderer.invoke("db:clients:delete", id),
      setAll: (clients) => ipcRenderer.invoke("db:clients:setAll", clients),
    },
    items: {
      getAll: () => ipcRenderer.invoke("db:items:getAll"),
      create: (item) => ipcRenderer.invoke("db:items:create", item),
      update: (id, item) => ipcRenderer.invoke("db:items:update", id, item),
      delete: (id) => ipcRenderer.invoke("db:items:delete", id),
      setAll: (items) => ipcRenderer.invoke("db:items:setAll", items),
    },
  },
});

