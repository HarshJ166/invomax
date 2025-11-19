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
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const getAllInvoices = () => {
  const db = getDatabase();
  const rows = db.select().from(invoicesTable).orderBy(desc(invoicesTable.createdAt)).all();
  return rows.map(mapToInvoice);
};

const getInvoiceById = (id) => {
  const db = getDatabase();
  const row = db.select().from(invoicesTable).where(eq(invoicesTable.id, id)).get();
  return row ? mapToInvoice(row) : null;
};

const createInvoice = (invoice) => {
  const db = getDatabase();
  db.insert(invoicesTable).values({
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
  }).run();
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
      updatedAt: new Date().toISOString(),
    })
    .where(eq(invoicesTable.id, id))
    .run();
};

const deleteInvoice = (id) => {
  const db = getDatabase();
  db.delete(invoicesTable).where(eq(invoicesTable.id, id)).run();
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

