const { getDatabase } = require("./db");

const getAllItems = () => {
  const db = getDatabase();
  const rows = db.prepare("SELECT * FROM items ORDER BY created_at DESC").all();
  return rows.map(row => ({
    id: row.id,
    itemName: row.item_name,
    itemDescription: row.item_description,
    hsnCode: row.hsn_code,
    qtyAvailable: row.qty_available,
    rate: row.rate,
    unit: row.unit,
  }));
};

const getItemById = (id) => {
  const db = getDatabase();
  const row = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
  if (!row) return null;
  
  return {
    id: row.id,
    itemName: row.item_name,
    itemDescription: row.item_description,
    hsnCode: row.hsn_code,
    qtyAvailable: row.qty_available,
    rate: row.rate,
    unit: row.unit,
  };
};

const createItem = (item) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO items (
      id, item_name, item_description, hsn_code, qty_available, rate, unit
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    item.id,
    item.itemName,
    item.itemDescription || null,
    item.hsnCode,
    item.qtyAvailable,
    item.rate,
    item.unit
  );
};

const updateItem = (id, item) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE items SET
      item_name = ?, item_description = ?, hsn_code = ?,
      qty_available = ?, rate = ?, unit = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(
    item.itemName,
    item.itemDescription || null,
    item.hsnCode,
    item.qtyAvailable,
    item.rate,
    item.unit,
    id
  );
};

const deleteItem = (id) => {
  const db = getDatabase();
  db.prepare("DELETE FROM items WHERE id = ?").run(id);
};

const setAllItems = (items) => {
  const db = getDatabase();
  const transaction = db.transaction((items) => {
    db.prepare("DELETE FROM items").run();
    const stmt = db.prepare(`
      INSERT INTO items (
        id, item_name, item_description, hsn_code, qty_available, rate, unit
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const item of items) {
      stmt.run(
        item.id,
        item.itemName,
        item.itemDescription || null,
        item.hsnCode,
        item.qtyAvailable,
        item.rate,
        item.unit
      );
    }
  });
  
  transaction(items);
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  setAllItems,
};

