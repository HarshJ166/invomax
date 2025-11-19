const { getDatabase, schema } = require("./db");
const { eq, desc } = require("drizzle-orm");
const { archives: archivesTable, invoices: invoicesTable } = schema;

const mapToArchive = (row) => ({
  id: row.id,
  originalId: row.originalId,
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
  archivedAt: row.archivedAt,
});

const getAllArchives = () => {
  const db = getDatabase();
  const rows = db.select().from(archivesTable).orderBy(desc(archivesTable.archivedAt)).all();
  return rows.map(mapToArchive);
};

const getArchiveById = (id) => {
  const db = getDatabase();
  const row = db.select().from(archivesTable).where(eq(archivesTable.id, id)).get();
  return row ? mapToArchive(row) : null;
};

const archiveInvoice = (invoice) => {
  const db = getDatabase();
  const archiveId = `archive-${invoice.id}-${Date.now()}`;
  
  const archiveData = {
    id: archiveId,
    originalId: invoice.id,
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
    createdAt: invoice.createdAt || new Date().toISOString(),
    updatedAt: invoice.updatedAt || new Date().toISOString(),
    archivedAt: new Date().toISOString(),
  };

  db.insert(archivesTable).values(archiveData).run();
  
  db.delete(invoicesTable).where(eq(invoicesTable.id, invoice.id)).run();
  
  return archiveData;
};

const restoreArchive = (archiveId) => {
  const db = getDatabase();
  const archive = getArchiveById(archiveId);
  
  if (!archive) {
    throw new Error("Archive not found");
  }

  const invoiceData = {
    id: archive.originalId,
    companyId: archive.companyId,
    clientId: archive.clientId,
    invoiceNumber: archive.invoiceNumber,
    invoiceDate: archive.invoiceDate,
    dueDate: archive.dueDate || null,
    items: archive.items,
    subtotal: archive.subtotal,
    taxAmount: archive.taxAmount || 0,
    totalAmount: archive.totalAmount,
    status: archive.status || "draft",
    notes: archive.notes || null,
    createdAt: archive.createdAt,
    updatedAt: new Date().toISOString(),
  };

  db.insert(invoicesTable).values(invoiceData).run();
  
  db.delete(archivesTable).where(eq(archivesTable.id, archiveId)).run();
  
  return invoiceData;
};

module.exports = {
  getAllArchives,
  getArchiveById,
  archiveInvoice,
  restoreArchive,
};

