const { getDatabase, schema } = require("./db");
const { eq, desc } = require("drizzle-orm");
const { quotations: quotationsTable } = schema;

const mapToQuotation = (row) => ({
  id: row.id,
  companyId: row.companyId,
  clientId: row.clientId || null,
  toPartyName: row.toPartyName || null,
  toPartyAddress: row.toPartyAddress || null,
  quotationId: row.quotationId,
  subject: row.subject,
  quotationDate: row.quotationDate,
  items: row.items,
  subtotal: row.subtotal,
  totalAmount: row.totalAmount,
  termsAndConditions: row.termsAndConditions || null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const getAllQuotations = () => {
  const db = getDatabase();
  const rows = db.select().from(quotationsTable).orderBy(desc(quotationsTable.createdAt)).all();
  return rows.map(mapToQuotation);
};

const getQuotationById = (id) => {
  const db = getDatabase();
  const row = db.select().from(quotationsTable).where(eq(quotationsTable.id, id)).get();
  return row ? mapToQuotation(row) : null;
};

const createQuotation = (quotation) => {
  const db = getDatabase();
  const values = {
    id: quotation.id,
    companyId: quotation.companyId,
    clientId: quotation.clientId || null,
    toPartyName: quotation.toPartyName || null,
    toPartyAddress: quotation.toPartyAddress || null,
    quotationId: quotation.quotationId,
    subject: quotation.subject,
    quotationDate: quotation.quotationDate,
    items: quotation.items,
    subtotal: quotation.subtotal,
    totalAmount: quotation.totalAmount,
    termsAndConditions: quotation.termsAndConditions || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.insert(quotationsTable).values(values).run();
};

const updateQuotation = (id, quotation) => {
  const db = getDatabase();
  db.update(quotationsTable)
    .set({
      companyId: quotation.companyId,
      clientId: quotation.clientId || null,
      toPartyName: quotation.toPartyName || null,
      toPartyAddress: quotation.toPartyAddress || null,
      quotationId: quotation.quotationId,
      subject: quotation.subject,
      quotationDate: quotation.quotationDate,
      items: quotation.items,
      subtotal: quotation.subtotal,
      totalAmount: quotation.totalAmount,
      termsAndConditions: quotation.termsAndConditions || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(quotationsTable.id, id))
    .run();
};

const deleteQuotation = (id) => {
  const db = getDatabase();
  db.delete(quotationsTable).where(eq(quotationsTable.id, id)).run();
};

const getQuotationByQuotationId = (quotationId) => {
  const db = getDatabase();
  const row = db
    .select()
    .from(quotationsTable)
    .where(eq(quotationsTable.quotationId, quotationId))
    .get();
  return row ? mapToQuotation(row) : null;
};

module.exports = {
  getAllQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  getQuotationByQuotationId,
};

