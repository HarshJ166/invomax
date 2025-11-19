const { getDatabase, schema } = require("./db");
const { eq, desc } = require("drizzle-orm");
const { items: itemsTable } = schema;

const mapToItem = (row) => ({
  id: row.id,
  itemName: row.itemName,
  itemDescription: row.itemDescription,
  hsnCode: row.hsnCode,
  qtyAvailable: row.qtyAvailable,
  rate: row.rate,
  unit: row.unit,
});

const getAllItems = () => {
  const db = getDatabase();
  const rows = db.select().from(itemsTable).orderBy(desc(itemsTable.createdAt)).all();
  return rows.map(mapToItem);
};

const getItemsPaginated = (limit = 10, offset = 0) => {
  const db = getDatabase();
  const rows = db.select()
    .from(itemsTable)
    .orderBy(desc(itemsTable.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
  return rows.map(mapToItem);
};

const getItemsCount = () => {
  const db = getDatabase();
  const sqliteDb = require("./db").getSqliteDatabase();
  const result = sqliteDb.prepare("SELECT COUNT(*) as count FROM items").get();
  return result?.count || 0;
};

const getItemById = (id) => {
  const db = getDatabase();
  const row = db.select().from(itemsTable).where(eq(itemsTable.id, id)).get();
  return row ? mapToItem(row) : null;
};

const createItem = (item) => {
  const db = getDatabase();
  db.insert(itemsTable).values({
    id: item.id,
    itemName: item.itemName,
    itemDescription: item.itemDescription || null,
    hsnCode: item.hsnCode,
    qtyAvailable: item.qtyAvailable,
    rate: item.rate,
    unit: item.unit,
  }).run();
};

const updateItem = (id, item) => {
  const db = getDatabase();
  db.update(itemsTable)
    .set({
      itemName: item.itemName,
      itemDescription: item.itemDescription || null,
      hsnCode: item.hsnCode,
      qtyAvailable: item.qtyAvailable,
      rate: item.rate,
      unit: item.unit,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(itemsTable.id, id))
    .run();
};

const deleteItem = (id) => {
  const db = getDatabase();
  db.delete(itemsTable).where(eq(itemsTable.id, id)).run();
};

const setAllItems = (itemsList) => {
  const db = getDatabase();
  const sqliteDb = require("./db").getSqliteDatabase();
  
  const transaction = sqliteDb.transaction(() => {
    db.delete(itemsTable).run();
    
    if (itemsList.length > 0) {
      const values = itemsList.map(item => ({
        id: item.id,
        itemName: item.itemName,
        itemDescription: item.itemDescription || null,
        hsnCode: item.hsnCode,
        qtyAvailable: item.qtyAvailable,
        rate: item.rate,
        unit: item.unit,
      }));
      
      db.insert(itemsTable).values(values).run();
    }
  });
  
  transaction();
};

module.exports = {
  getAllItems,
  getItemsPaginated,
  getItemsCount,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  setAllItems,
};
