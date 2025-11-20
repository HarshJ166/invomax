const { getDatabase, schema } = require("./db");
const { eq, desc } = require("drizzle-orm");
const { purchases: purchasesTable } = schema;
const itemsDb = require("./items");

const mapToPurchase = (row) => ({
  id: row.id,
  itemId: row.itemId,
  clientId: row.clientId,
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

const createPurchase = (purchase) => {
  const db = getDatabase();
  const sqliteDb = require("./db").getSqliteDatabase();

  const transaction = sqliteDb.transaction(() => {
    // 1. Create Purchase
    db.insert(purchasesTable).values({
      id: purchase.id,
      itemId: purchase.itemId,
      clientId: purchase.clientId,
      quantity: purchase.quantity,
      rate: purchase.rate,
      amount: purchase.amount,
      date: purchase.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).run();

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
  });

  transaction();
  return purchase;
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
