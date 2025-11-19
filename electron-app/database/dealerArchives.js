const { getDatabase, schema } = require("./db");
const { eq, desc } = require("drizzle-orm");
const { dealerArchives: dealerArchivesTable, dealers: dealersTable } = schema;

const mapToDealerArchive = (row) => ({
  id: row.id,
  originalId: row.originalId,
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
  archivedAt: row.archivedAt,
});

const getAllDealerArchives = () => {
  const db = getDatabase();
  const rows = db.select().from(dealerArchivesTable).orderBy(desc(dealerArchivesTable.archivedAt)).all();
  return rows.map(mapToDealerArchive);
};

const getDealerArchiveById = (id) => {
  const db = getDatabase();
  const row = db.select().from(dealerArchivesTable).where(eq(dealerArchivesTable.id, id)).get();
  return row ? mapToDealerArchive(row) : null;
};

const archiveDealer = (dealer) => {
  const db = getDatabase();
  const archiveId = `dealer-archive-${dealer.id}-${Date.now()}`;
  
  const archiveData = {
    id: archiveId,
    originalId: dealer.id,
    companyId: dealer.companyId,
    clientId: dealer.clientId,
    billNumber: dealer.billNumber,
    billDate: dealer.billDate,
    billAmountTotal: dealer.billAmountTotal,
    paymentMode: dealer.paymentMode,
    referenceNumber: dealer.referenceNumber || null,
    paymentStatus: dealer.paymentStatus,
    paidAmount: dealer.paidAmount || 0,
    balanceAmount: dealer.balanceAmount || 0,
    description: dealer.description || null,
    createdAt: dealer.createdAt || new Date().toISOString(),
    updatedAt: dealer.updatedAt || new Date().toISOString(),
    archivedAt: new Date().toISOString(),
  };

  db.insert(dealerArchivesTable).values(archiveData).run();
  
  db.delete(dealersTable).where(eq(dealersTable.id, dealer.id)).run();
  
  return archiveData;
};

const restoreDealerArchive = (archiveId) => {
  const db = getDatabase();
  const archive = getDealerArchiveById(archiveId);
  
  if (!archive) {
    throw new Error("Dealer archive not found");
  }

  const dealerData = {
    id: archive.originalId,
    companyId: archive.companyId,
    clientId: archive.clientId,
    billNumber: archive.billNumber,
    billDate: archive.billDate,
    billAmountTotal: archive.billAmountTotal,
    paymentMode: archive.paymentMode,
    referenceNumber: archive.referenceNumber || null,
    paymentStatus: archive.paymentStatus,
    paidAmount: archive.paidAmount || 0,
    balanceAmount: archive.balanceAmount || 0,
    description: archive.description || null,
    createdAt: archive.createdAt,
    updatedAt: new Date().toISOString(),
  };

  db.insert(dealersTable).values(dealerData).run();
  
  db.delete(dealerArchivesTable).where(eq(dealerArchivesTable.id, archiveId)).run();
  
  return dealerData;
};

module.exports = {
  getAllDealerArchives,
  getDealerArchiveById,
  archiveDealer,
  restoreDealerArchive,
};

