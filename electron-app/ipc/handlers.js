const { getDbPath } = require("../database/db");
const companiesDb = require("../database/companies");
const clientsDb = require("../database/clients");
const itemsDb = require("../database/items");
const invoicesDb = require("../database/invoices");
const archivesDb = require("../database/archives");
const dealersDb = require("../database/dealers");
const dealerArchivesDb = require("../database/dealerArchives");
const quotationsDb = require("../database/quotations");

const createHandler = (operation, errorMessage) => {
  return (...args) => {
    try {
      const result = operation(...args);
      if (result !== undefined) {
        return typeof result === "object" && "success" in result
          ? result
          : { success: true, data: result };
      }
      return { success: true };
    } catch (error) {
      console.error(errorMessage, error);
      return { success: false, error: error.message };
    }
  };
};

const createDataHandler = (operation, errorMessage) => {
  return (...args) => {
    try {
      const data = operation(...args);
      return { success: true, data };
    } catch (error) {
      console.error(errorMessage, error);
      return { success: false, error: error.message };
    }
  };
};

const createPaginatedHandler = (getDataFn, getCountFn, errorMessage) => {
  return (_, limit, offset) => {
    try {
      const data = getDataFn(limit, offset);
      const total = getCountFn();
      return { success: true, data, total };
    } catch (error) {
      console.error(errorMessage, error);
      return { success: false, error: error.message };
    }
  };
};

const setupIpcHandlers = (ipcMain) => {
  ipcMain.handle("db:getPath", () => {
    return getDbPath();
  });

  ipcMain.handle(
    "db:companies:getAll",
    createDataHandler(
      () => companiesDb.getAllCompanies(),
      "Error getting companies:"
    )
  );

  ipcMain.handle(
    "db:companies:getPaginated",
    createPaginatedHandler(
      (limit, offset) => companiesDb.getCompaniesPaginated(limit, offset),
      () => companiesDb.getCompaniesCount(),
      "Error getting paginated companies:"
    )
  );

  ipcMain.handle(
    "db:companies:getCount",
    createHandler(
      () => ({ count: companiesDb.getCompaniesCount() }),
      "Error getting companies count:"
    )
  );

  ipcMain.handle(
    "db:companies:create",
    createHandler(
      (_, company) => companiesDb.createCompany(company),
      "Error creating company:"
    )
  );

  ipcMain.handle(
    "db:companies:update",
    createHandler(
      (_, id, company) => companiesDb.updateCompany(id, company),
      "Error updating company:"
    )
  );

  ipcMain.handle(
    "db:companies:delete",
    createHandler(
      (_, id) => companiesDb.deleteCompany(id),
      "Error deleting company:"
    )
  );

  ipcMain.handle(
    "db:companies:setAll",
    createHandler(
      (_, companies) => companiesDb.setAllCompanies(companies),
      "Error setting companies:"
    )
  );

  ipcMain.handle(
    "db:clients:getAll",
    createDataHandler(
      () => clientsDb.getAllClients(),
      "Error getting clients:"
    )
  );

  ipcMain.handle(
    "db:clients:getPaginated",
    createPaginatedHandler(
      (limit, offset) => clientsDb.getClientsPaginated(limit, offset),
      () => clientsDb.getClientsCount(),
      "Error getting paginated clients:"
    )
  );

  ipcMain.handle(
    "db:clients:getCount",
    createHandler(
      () => ({ count: clientsDb.getClientsCount() }),
      "Error getting clients count:"
    )
  );

  ipcMain.handle(
    "db:clients:create",
    createHandler(
      (_, client) => clientsDb.createClient(client),
      "Error creating client:"
    )
  );

  ipcMain.handle(
    "db:clients:update",
    createHandler(
      (_, id, client) => clientsDb.updateClient(id, client),
      "Error updating client:"
    )
  );

  ipcMain.handle(
    "db:clients:delete",
    createHandler(
      (_, id) => clientsDb.deleteClient(id),
      "Error deleting client:"
    )
  );

  ipcMain.handle(
    "db:clients:setAll",
    createHandler(
      (_, clients) => clientsDb.setAllClients(clients),
      "Error setting clients:"
    )
  );

  ipcMain.handle(
    "db:items:getAll",
    createDataHandler(
      () => itemsDb.getAllItems(),
      "Error getting items:"
    )
  );

  ipcMain.handle(
    "db:items:getPaginated",
    createPaginatedHandler(
      (limit, offset) => itemsDb.getItemsPaginated(limit, offset),
      () => itemsDb.getItemsCount(),
      "Error getting paginated items:"
    )
  );

  ipcMain.handle(
    "db:items:getCount",
    createHandler(
      () => ({ count: itemsDb.getItemsCount() }),
      "Error getting items count:"
    )
  );

  ipcMain.handle(
    "db:items:create",
    createHandler(
      (_, item) => itemsDb.createItem(item),
      "Error creating item:"
    )
  );

  ipcMain.handle(
    "db:items:update",
    createHandler(
      (_, id, item) => itemsDb.updateItem(id, item),
      "Error updating item:"
    )
  );

  ipcMain.handle(
    "db:items:delete",
    createHandler(
      (_, id) => itemsDb.deleteItem(id),
      "Error deleting item:"
    )
  );

  ipcMain.handle(
    "db:items:setAll",
    createHandler(
      (_, items) => itemsDb.setAllItems(items),
      "Error setting items:"
    )
  );

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

  ipcMain.handle(
    "db:invoices:update",
    createHandler(
      (_, id, invoice) => invoicesDb.updateInvoice(id, invoice),
      "Error updating invoice:"
    )
  );

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

  ipcMain.handle(
    "db:invoices:getById",
    createDataHandler(
      (_, id) => invoicesDb.getInvoiceById(id),
      "Error getting invoice:"
    )
  );

  ipcMain.handle(
    "db:invoices:getLastByCompanyId",
    createDataHandler(
      (_, companyId) => invoicesDb.getLastInvoiceByCompanyId(companyId),
      "Error getting last invoice:"
    )
  );

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

  ipcMain.handle(
    "db:archives:getAll",
    createDataHandler(
      () => archivesDb.getAllArchives(),
      "Error getting archives:"
    )
  );

  ipcMain.handle(
    "db:archives:restore",
    createDataHandler(
      (_, archiveId) => archivesDb.restoreArchive(archiveId),
      "Error restoring archive:"
    )
  );

  ipcMain.handle(
    "db:dealers:getAll",
    createDataHandler(
      () => dealersDb.getAllDealers(),
      "Error getting dealers:"
    )
  );

  ipcMain.handle(
    "db:dealers:getByCompanyId",
    createDataHandler(
      (_, companyId) => dealersDb.getDealersByCompanyId(companyId),
      "Error getting dealers by company:"
    )
  );

  ipcMain.handle(
    "db:dealers:getByCompanyIdAndClientId",
    createDataHandler(
      (_, companyId, clientId) =>
        dealersDb.getDealersByCompanyIdAndClientId(companyId, clientId),
      "Error getting dealers by company and client:"
    )
  );

  ipcMain.handle(
    "db:dealers:getById",
    createDataHandler(
      (_, id) => dealersDb.getDealerById(id),
      "Error getting dealer:"
    )
  );

  ipcMain.handle(
    "db:dealers:create",
    createHandler(
      (_, dealer) => dealersDb.createDealer(dealer),
      "Error creating dealer:"
    )
  );

  ipcMain.handle(
    "db:dealers:update",
    createHandler(
      (_, id, dealer) => dealersDb.updateDealer(id, dealer),
      "Error updating dealer:"
    )
  );

  ipcMain.handle(
    "db:dealers:delete",
    createHandler(
      (_, id) => dealersDb.deleteDealer(id),
      "Error deleting dealer:"
    )
  );

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

  ipcMain.handle(
    "db:dealerArchives:getAll",
    createDataHandler(
      () => dealerArchivesDb.getAllDealerArchives(),
      "Error getting dealer archives:"
    )
  );

  ipcMain.handle(
    "db:dealerArchives:restore",
    createDataHandler(
      (_, archiveId) => dealerArchivesDb.restoreDealerArchive(archiveId),
      "Error restoring dealer archive:"
    )
  );

  ipcMain.handle(
    "db:quotations:getAll",
    createDataHandler(
      () => quotationsDb.getAllQuotations(),
      "Error getting quotations:"
    )
  );

  ipcMain.handle(
    "db:quotations:getById",
    createDataHandler(
      (_, id) => quotationsDb.getQuotationById(id),
      "Error getting quotation:"
    )
  );

  ipcMain.handle(
    "db:quotations:create",
    createHandler(
      (_, quotation) => quotationsDb.createQuotation(quotation),
      "Error creating quotation:"
    )
  );

  ipcMain.handle(
    "db:quotations:update",
    createHandler(
      (_, id, quotation) => quotationsDb.updateQuotation(id, quotation),
      "Error updating quotation:"
    )
  );

  ipcMain.handle(
    "db:quotations:delete",
    createHandler(
      (_, id) => quotationsDb.deleteQuotation(id),
      "Error deleting quotation:"
    )
  );

  ipcMain.handle(
    "db:quotations:getByQuotationId",
    createDataHandler(
      (_, quotationId) => quotationsDb.getQuotationByQuotationId(quotationId),
      "Error getting quotation by quotation ID:"
    )
  );
};

module.exports = { setupIpcHandlers };

