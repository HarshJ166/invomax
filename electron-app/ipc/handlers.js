const { getDbPath } = require("../database/db");
const companiesDb = require("../database/companies");
const clientsDb = require("../database/clients");
const itemsDb = require("../database/items");

const setupIpcHandlers = (ipcMain) => {
  ipcMain.handle("db:getPath", () => {
    return getDbPath();
  });

  ipcMain.handle("db:companies:getAll", () => {
    try {
      return { success: true, data: companiesDb.getAllCompanies() };
    } catch (error) {
      console.error("Error getting companies:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:companies:create", (_, company) => {
    try {
      companiesDb.createCompany(company);
      return { success: true };
    } catch (error) {
      console.error("Error creating company:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:companies:update", (_, id, company) => {
    try {
      companiesDb.updateCompany(id, company);
      return { success: true };
    } catch (error) {
      console.error("Error updating company:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:companies:delete", (_, id) => {
    try {
      companiesDb.deleteCompany(id);
      return { success: true };
    } catch (error) {
      console.error("Error deleting company:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:companies:setAll", (_, companies) => {
    try {
      companiesDb.setAllCompanies(companies);
      return { success: true };
    } catch (error) {
      console.error("Error setting companies:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:clients:getAll", () => {
    try {
      return { success: true, data: clientsDb.getAllClients() };
    } catch (error) {
      console.error("Error getting clients:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:clients:create", (_, client) => {
    try {
      clientsDb.createClient(client);
      return { success: true };
    } catch (error) {
      console.error("Error creating client:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:clients:update", (_, id, client) => {
    try {
      clientsDb.updateClient(id, client);
      return { success: true };
    } catch (error) {
      console.error("Error updating client:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:clients:delete", (_, id) => {
    try {
      clientsDb.deleteClient(id);
      return { success: true };
    } catch (error) {
      console.error("Error deleting client:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:clients:setAll", (_, clients) => {
    try {
      clientsDb.setAllClients(clients);
      return { success: true };
    } catch (error) {
      console.error("Error setting clients:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:items:getAll", () => {
    try {
      return { success: true, data: itemsDb.getAllItems() };
    } catch (error) {
      console.error("Error getting items:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:items:create", (_, item) => {
    try {
      itemsDb.createItem(item);
      return { success: true };
    } catch (error) {
      console.error("Error creating item:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:items:update", (_, id, item) => {
    try {
      itemsDb.updateItem(id, item);
      return { success: true };
    } catch (error) {
      console.error("Error updating item:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:items:delete", (_, id) => {
    try {
      itemsDb.deleteItem(id);
      return { success: true };
    } catch (error) {
      console.error("Error deleting item:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:items:setAll", (_, items) => {
    try {
      itemsDb.setAllItems(items);
      return { success: true };
    } catch (error) {
      console.error("Error setting items:", error);
      return { success: false, error: error.message };
    }
  });
};

module.exports = { setupIpcHandlers };

