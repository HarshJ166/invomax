const { getDatabase, schema } = require("./db");
const { eq, desc, and } = require("drizzle-orm");
const { dealers: dealersTable } = schema;

const mapToDealer = (row) => ({
  id: row.id,
  companyId: row.companyId,
  clientId: row.clientId,
  billNumber: row.billNumber,
  billDate: row.billDate,
  billAmountTotal: row.billAmountTotal,
  paymentMode: row.paymentMode,
  referenceNumber: row.referenceNumber || null,
  paymentStatus: row.paymentStatus,
  paidAmount: row.paidAmount || 0,
  balanceAmount: row.balanceAmount || 0,
  description: row.description || null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const getAllDealers = () => {
  const db = getDatabase();
  const rows = db.select().from(dealersTable).orderBy(desc(dealersTable.createdAt)).all();
  return rows.map(mapToDealer);
};

const getDealersByCompanyId = (companyId) => {
  const db = getDatabase();
  const rows = db
    .select()
    .from(dealersTable)
    .where(eq(dealersTable.companyId, companyId))
    .orderBy(desc(dealersTable.createdAt))
    .all();
  return rows.map(mapToDealer);
};

const getDealersByCompanyIdAndClientId = (companyId, clientId) => {
  const db = getDatabase();
  const rows = db
    .select()
    .from(dealersTable)
    .where(and(
      eq(dealersTable.companyId, companyId),
      eq(dealersTable.clientId, clientId)
    ))
    .orderBy(desc(dealersTable.createdAt))
    .all();
  return rows.map(mapToDealer);
};

const getDealerById = (id) => {
  const db = getDatabase();
  const row = db.select().from(dealersTable).where(eq(dealersTable.id, id)).get();
  return row ? mapToDealer(row) : null;
};

const createDealer = (dealer) => {
  const db = getDatabase();
  
  let balanceAmount = 0;
  if (dealer.paymentStatus === "partial_paid") {
    balanceAmount = dealer.billAmountTotal - (dealer.paidAmount || 0);
  } else if (dealer.paymentStatus === "unpaid") {
    balanceAmount = dealer.billAmountTotal;
  }
  
  db.insert(dealersTable).values({
    id: dealer.id,
    companyId: dealer.companyId,
    clientId: dealer.clientId,
    billNumber: dealer.billNumber,
    billDate: dealer.billDate,
    billAmountTotal: dealer.billAmountTotal,
    paymentMode: dealer.paymentMode,
    referenceNumber: dealer.referenceNumber || null,
    paymentStatus: dealer.paymentStatus,
    paidAmount: dealer.paidAmount || 0,
    balanceAmount: balanceAmount,
    description: dealer.description || null,
  }).run();
};

const updateDealer = (id, dealer) => {
  const db = getDatabase();
  
  let balanceAmount = 0;
  if (dealer.paymentStatus === "partial_paid") {
    balanceAmount = dealer.billAmountTotal - (dealer.paidAmount || 0);
  } else if (dealer.paymentStatus === "unpaid") {
    balanceAmount = dealer.billAmountTotal;
  }
  
  db.update(dealersTable)
    .set({
      companyId: dealer.companyId,
      clientId: dealer.clientId,
      billNumber: dealer.billNumber,
      billDate: dealer.billDate,
      billAmountTotal: dealer.billAmountTotal,
      paymentMode: dealer.paymentMode,
      referenceNumber: dealer.referenceNumber || null,
      paymentStatus: dealer.paymentStatus,
      paidAmount: dealer.paidAmount || 0,
      balanceAmount: balanceAmount,
      description: dealer.description || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(dealersTable.id, id))
    .run();
};

const deleteDealer = (id) => {
  const db = getDatabase();
  db.delete(dealersTable).where(eq(dealersTable.id, id)).run();
};

module.exports = {
  getAllDealers,
  getDealersByCompanyId,
  getDealersByCompanyIdAndClientId,
  getDealerById,
  createDealer,
  updateDealer,
  deleteDealer,
};

