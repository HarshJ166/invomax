const { getDatabase, schema } = require("./db");
const { eq, desc } = require("drizzle-orm");
const { purchases: purchasesTable, dealers: dealersTable } = schema;
const itemsDb = require("./items");
const { v4: uuidv4 } = require("uuid");

const mapToPurchase = (row) => ({
  id: row.id,
  itemId: row.itemId,
  clientId: row.clientId,
  invoiceNumber: row.invoiceNumber,
  companyId: row.companyId,
  quantity: row.quantity,
  rate: row.rate,
  amount: row.amount,
  date: row.date,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const getAllPurchases = () => {
  const db = getDatabase();
  const rows = db.select().from(purchasesTable).orderBy(desc(purchasesTable.createdAt)).all();
  return rows.map(mapToPurchase);
};

const createPurchase = (data) => {
  const db = getDatabase();
  const sqliteDb = require("./db").getSqliteDatabase();

  // Handle both single purchase (legacy) and bulk purchase with bill details
  const isBulk = Array.isArray(data.items);
  const purchases = isBulk ? data.items : [data];
  
  const transaction = sqliteDb.transaction(() => {
    let totalBillAmount = 0;

    for (const purchase of purchases) {
      // 1. Create Purchase Record
      db.insert(purchasesTable).values({
        id: purchase.id || `pur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        itemId: purchase.itemId,
        clientId: data.clientId || purchase.clientId,
        companyId: data.companyId || purchase.companyId || null,
        invoiceNumber: data.invoiceNumber || purchase.invoiceNumber || null,
        quantity: purchase.quantity,
        rate: purchase.rate,
        amount: purchase.amount,
        date: data.date || purchase.date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).run();

      totalBillAmount += parseFloat(purchase.amount) || 0;

      // 2. Update Item Inventory (Increase)
      const item = itemsDb.getItemById(purchase.itemId);
      if (item) {
        const currentQty = parseFloat(item.qtyAvailable) || 0;
        const purchaseQty = parseFloat(purchase.quantity) || 0;
        const newQty = currentQty + purchaseQty;
        
        itemsDb.updateItem(item.id, {
          ...item,
          qtyAvailable: newQty.toString(),
        });
      }
    }

    // 3. Create Dealer Payment Record (if we have bill details)
    if (data.invoiceNumber && data.companyId && data.clientId) {
      db.insert(dealersTable).values({
        id: `dp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        companyId: data.companyId,
        clientId: data.clientId,
        billNumber: data.invoiceNumber,
        billDate: data.date,
        billAmountTotal: totalBillAmount,
        paymentMode: "cash", // Default, can be updated later
        paymentStatus: "unpaid",
        paidAmount: 0,
        balanceAmount: totalBillAmount,
        description: "Auto-generated from Purchase Entry",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).run();
    }
  });

  transaction();
  return data;
};

const deletePurchase = (id) => {
  const db = getDatabase();
  db.delete(purchasesTable).where(eq(purchasesTable.id, id)).run();
};

module.exports = {
  getAllPurchases,
  createPurchase,
  deletePurchase,
};
