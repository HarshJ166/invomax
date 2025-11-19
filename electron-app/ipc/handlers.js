const { getDbPath } = require("../database/db");
const companiesDb = require("../database/companies");
const clientsDb = require("../database/clients");
const itemsDb = require("../database/items");
const invoicesDb = require("../database/invoices");
const archivesDb = require("../database/archives");
const dealersDb = require("../database/dealers");
const dealerArchivesDb = require("../database/dealerArchives");

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

  ipcMain.handle("db:companies:getPaginated", (_, limit, offset) => {
    try {
      const data = companiesDb.getCompaniesPaginated(limit, offset);
      const total = companiesDb.getCompaniesCount();
      return { success: true, data, total };
    } catch (error) {
      console.error("Error getting paginated companies:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:companies:getCount", () => {
    try {
      const count = companiesDb.getCompaniesCount();
      return { success: true, count };
    } catch (error) {
      console.error("Error getting companies count:", error);
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

  ipcMain.handle("db:clients:getPaginated", (_, limit, offset) => {
    try {
      const data = clientsDb.getClientsPaginated(limit, offset);
      const total = clientsDb.getClientsCount();
      return { success: true, data, total };
    } catch (error) {
      console.error("Error getting paginated clients:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:clients:getCount", () => {
    try {
      const count = clientsDb.getClientsCount();
      return { success: true, count };
    } catch (error) {
      console.error("Error getting clients count:", error);
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

  ipcMain.handle("db:items:getPaginated", (_, limit, offset) => {
    try {
      const data = itemsDb.getItemsPaginated(limit, offset);
      const total = itemsDb.getItemsCount();
      return { success: true, data, total };
    } catch (error) {
      console.error("Error getting paginated items:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:items:getCount", () => {
    try {
      const count = itemsDb.getItemsCount();
      return { success: true, count };
    } catch (error) {
      console.error("Error getting items count:", error);
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

  ipcMain.handle("db:invoices:archive", (_, invoiceId) => {
    try {
      const invoice = invoicesDb.getInvoiceById(invoiceId);
      if (!invoice) {
        return { success: false, error: "Invoice not found" };
      }
      const archived = archivesDb.archiveInvoice(invoice);
      return { success: true, data: archived };
    } catch (error) {
      console.error("Error archiving invoice:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:archives:getAll", () => {
    try {
      return { success: true, data: archivesDb.getAllArchives() };
    } catch (error) {
      console.error("Error getting archives:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:archives:restore", (_, archiveId) => {
    try {
      const invoice = archivesDb.restoreArchive(archiveId);
      return { success: true, data: invoice };
    } catch (error) {
      console.error("Error restoring archive:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:dealers:getAll", () => {
    try {
      return { success: true, data: dealersDb.getAllDealers() };
    } catch (error) {
      console.error("Error getting dealers:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:dealers:getByCompanyId", (_, companyId) => {
    try {
      return { success: true, data: dealersDb.getDealersByCompanyId(companyId) };
    } catch (error) {
      console.error("Error getting dealers by company:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:dealers:getByCompanyIdAndClientId", (_, companyId, clientId) => {
    try {
      return { success: true, data: dealersDb.getDealersByCompanyIdAndClientId(companyId, clientId) };
    } catch (error) {
      console.error("Error getting dealers by company and client:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:dealers:getById", (_, id) => {
    try {
      const dealer = dealersDb.getDealerById(id);
      return { success: true, data: dealer };
    } catch (error) {
      console.error("Error getting dealer:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:dealers:create", (_, dealer) => {
    try {
      dealersDb.createDealer(dealer);
      return { success: true };
    } catch (error) {
      console.error("Error creating dealer:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:dealers:update", (_, id, dealer) => {
    try {
      dealersDb.updateDealer(id, dealer);
      return { success: true };
    } catch (error) {
      console.error("Error updating dealer:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:dealers:delete", (_, id) => {
    try {
      dealersDb.deleteDealer(id);
      return { success: true };
    } catch (error) {
      console.error("Error deleting dealer:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:dealers:archive", (_, dealerId) => {
    try {
      const dealer = dealersDb.getDealerById(dealerId);
      if (!dealer) {
        return { success: false, error: "Dealer payment not found" };
      }
      const archived = dealerArchivesDb.archiveDealer(dealer);
      return { success: true, data: archived };
    } catch (error) {
      console.error("Error archiving dealer:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:dealerArchives:getAll", () => {
    try {
      return { success: true, data: dealerArchivesDb.getAllDealerArchives() };
    } catch (error) {
      console.error("Error getting dealer archives:", error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("db:dealerArchives:restore", (_, archiveId) => {
    try {
      const dealer = dealerArchivesDb.restoreDealerArchive(archiveId);
      return { success: true, data: dealer };
    } catch (error) {
      console.error("Error restoring dealer archive:", error);
      return { success: false, error: error.message };
    }
  });
};

module.exports = { setupIpcHandlers };

