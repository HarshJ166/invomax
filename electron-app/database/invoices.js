const { getDatabase, schema } = require("./db");
const { eq, desc } = require("drizzle-orm");
const { invoices: invoicesTable } = schema;

const mapToInvoice = (row) => ({
  id: row.id,
  companyId: row.companyId,
  clientId: row.clientId,
  invoiceNumber: row.invoiceNumber,
  invoiceDate: row.invoiceDate,
  dueDate: row.dueDate,
  items: row.items,
  subtotal: row.subtotal,
  taxAmount: row.taxAmount,
  totalAmount: row.totalAmount,
  status: row.status,
  notes: row.notes,
  image: row.image || null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const getAllInvoices = () => {
  console.log("[DB] getAllInvoices called");
  const db = getDatabase();
  const rows = db.select().from(invoicesTable).orderBy(desc(invoicesTable.createdAt)).all();
  console.log("[DB] getAllInvoices result:", {
    count: rows.length,
    invoiceIds: rows.map((row) => row.id),
  });
  return rows.map(mapToInvoice);
};

const getInvoiceById = (id) => {
  const db = getDatabase();
  const row = db.select().from(invoicesTable).where(eq(invoicesTable.id, id)).get();
  return row ? mapToInvoice(row) : null;
};

const createInvoice = (invoice) => {
  console.log("[DB] createInvoice called");
  console.log("[DB] Invoice data:", {
    id: invoice?.id,
    companyId: invoice?.companyId,
    clientId: invoice?.clientId,
    invoiceNumber: invoice?.invoiceNumber,
    invoiceDate: invoice?.invoiceDate,
    totalAmount: invoice?.totalAmount,
  });

  try {
    const db = getDatabase();
    console.log("[DB] Database connection obtained");

    const values = {
      id: invoice.id,
      companyId: invoice.companyId,
      clientId: invoice.clientId,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate || null,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount || 0,
      totalAmount: invoice.totalAmount,
      status: invoice.status || "draft",
      notes: invoice.notes || null,
      image: invoice.image || null,
    };

    console.log("[DB] Inserting invoice with values:", {
      id: values.id,
      companyId: values.companyId,
      clientId: values.clientId,
      invoiceNumber: values.invoiceNumber,
    });

    db.insert(invoicesTable).values(values).run();
    console.log("[DB] Invoice inserted successfully");

    console.log("[DB] Verifying invoice exists...");
    const insertedInvoice = getInvoiceById(invoice.id);
    console.log("[DB] Verification result:", {
      invoiceId: invoice.id,
      found: !!insertedInvoice,
      invoiceNumber: insertedInvoice?.invoiceNumber,
    });

    if (!insertedInvoice) {
      console.error("[DB] ERROR: Invoice not found immediately after insertion!");
    }

    console.log("[DB] Getting all invoices to check count...");
    const allInvoices = getAllInvoices();
    console.log("[DB] Total invoices in DB:", allInvoices.length);
    console.log("[DB] Invoice IDs:", allInvoices.map((inv) => inv.id));
  } catch (error) {
    console.error("[DB] Exception in createInvoice:", error);
    console.error("[DB] Error stack:", error.stack);
    throw error;
  }
};

const updateInvoice = (id, invoice) => {
  const db = getDatabase();
  db.update(invoicesTable)
    .set({
      companyId: invoice.companyId,
      clientId: invoice.clientId,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate || null,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount || 0,
      totalAmount: invoice.totalAmount,
      status: invoice.status || "draft",
      notes: invoice.notes || null,
      image: invoice.image || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(invoicesTable.id, id))
    .run();
};

const deleteInvoice = (id) => {
  console.log("[DB] deleteInvoice called with ID:", id);
  const db = getDatabase();
  console.log("[DB] Checking if invoice exists before deletion...");
  const invoiceBeforeDelete = getInvoiceById(id);
  console.log("[DB] Invoice before deletion:", {
    exists: !!invoiceBeforeDelete,
    invoiceNumber: invoiceBeforeDelete?.invoiceNumber,
  });
  
  db.delete(invoicesTable).where(eq(invoicesTable.id, id)).run();
  console.log("[DB] Invoice deleted");
  
  console.log("[DB] Verifying invoice is deleted...");
  const invoiceAfterDelete = getInvoiceById(id);
  console.log("[DB] Invoice after deletion:", {
    exists: !!invoiceAfterDelete,
  });
  
  const allInvoices = getAllInvoices();
  console.log("[DB] Total invoices after deletion:", allInvoices.length);
};

const getLastInvoiceByCompanyId = (companyId) => {
  const db = getDatabase();
  const row = db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.companyId, companyId))
    .orderBy(desc(invoicesTable.createdAt))
    .limit(1)
    .get();
  return row ? mapToInvoice(row) : null;
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getLastInvoiceByCompanyId,
};

