const { getDbPath } = require("../database/db");
const companiesDb = require("../database/companies");
const clientsDb = require("../database/clients");
const itemsDb = require("../database/items");
const invoicesDb = require("../database/invoices");

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

  ipcMain.handle("db:invoices:getAll", () => {
    console.log("[IPC] db:invoices:getAll handler called");
    try {
      const invoices = invoicesDb.getAllInvoices();
      console.log("[IPC] getAllInvoices result:", {
        count: invoices.length,
        invoiceIds: invoices.map((inv) => inv.id),
        invoiceNumbers: invoices.map((inv) => inv.invoiceNumber),
      });
      return { success: true, data: invoices };
    } catch (error) {
      console.error("[IPC] Error getting invoices:", error);
      console.error("[IPC] Error stack:", error.stack);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:invoices:create", (_, invoice) => {
    console.log("[IPC] db:invoices:create handler called");
    console.log("[IPC] Invoice data received:", {
      id: invoice?.id,
      companyId: invoice?.companyId,
      clientId: invoice?.clientId,
      invoiceNumber: invoice?.invoiceNumber,
      totalAmount: invoice?.totalAmount,
    });

    try {
      console.log("[IPC] Calling invoicesDb.createInvoice...");
      invoicesDb.createInvoice(invoice);
      console.log("[IPC] Invoice created in database");

      console.log("[IPC] Verifying invoice exists in DB...");
      const allInvoices = invoicesDb.getAllInvoices();
      const invoiceExists = allInvoices.some((inv) => inv.id === invoice?.id);
      console.log("[IPC] Verification result:", {
        invoiceId: invoice?.id,
        exists: invoiceExists,
        totalInvoices: allInvoices.length,
      });

      if (!invoiceExists) {
        console.error("[IPC] ERROR: Invoice not found after creation!");
      }

      return { success: true };
    } catch (error) {
      console.error("[IPC] Error creating invoice:", error);
      console.error("[IPC] Error stack:", error.stack);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:invoices:update", (_, id, invoice) => {
    try {
      invoicesDb.updateInvoice(id, invoice);
      return { success: true };
    } catch (error) {
      console.error("Error updating invoice:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:invoices:delete", (_, id) => {
    console.log("[IPC] db:invoices:delete handler called with ID:", id);
    try {
      invoicesDb.deleteInvoice(id);
      console.log("[IPC] Invoice deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("[IPC] Error deleting invoice:", error);
      console.error("[IPC] Error stack:", error.stack);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:invoices:getById", (_, id) => {
    try {
      const invoice = invoicesDb.getInvoiceById(id);
      return { success: true, data: invoice };
    } catch (error) {
      console.error("Error getting invoice:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:invoices:getLastByCompanyId", (_, companyId) => {
    try {
      const invoice = invoicesDb.getLastInvoiceByCompanyId(companyId);
      return { success: true, data: invoice };
    } catch (error) {
      console.error("Error getting last invoice:", error);
      return { success: false, error: error.message };
    }
  });
};

module.exports = { setupIpcHandlers };

