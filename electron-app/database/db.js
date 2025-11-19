const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const { companies, clients, items, invoices, archives, dealers, dealerArchives } = require("./schema");
const { migrate } = require("drizzle-orm/better-sqlite3/migrator");

const getDbPath = () => {
  if (process.env.DATABASE_URL) {
    const dbPath = process.env.DATABASE_URL;
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    return dbPath;
  }
  
  const electronAppDir = path.join(__dirname, "..");
  const dbPath = path.join(electronAppDir, "invoicegen.db");
  
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  return dbPath;
};

let sqliteDb = null;
let db = null;

const initializeDatabase = () => {
  const dbPath = getDbPath();
  sqliteDb = new Database(dbPath);
  
  sqliteDb.pragma("journal_mode = WAL");
  sqliteDb.pragma("foreign_keys = ON");
  
  db = drizzle(sqliteDb);
  
  createTables();
  
  return db;
};

const createTables = () => {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      proprietor TEXT NOT NULL,
      address TEXT NOT NULL,
      email TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      state TEXT NOT NULL,
      city TEXT NOT NULL,
      gst_number TEXT,
      invoice_number_initial TEXT NOT NULL,
      logo TEXT,
      signature TEXT,
      account_number TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      ifsc_code TEXT NOT NULL,
      branch TEXT NOT NULL,
      revenue_total REAL DEFAULT 0,
      debt REAL DEFAULT 0,
      invoice_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      customer_type TEXT NOT NULL CHECK(customer_type IN ('business', 'individual')),
      salutation TEXT CHECK(salutation IN ('mr', 'ms', 'mrs')),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      pan_number TEXT,
      company_name TEXT,
      currency TEXT DEFAULT 'inr',
      gst_applicable INTEGER DEFAULT 0,
      gstin TEXT,
      state_code TEXT,
      billing_country TEXT,
      billing_state TEXT,
      billing_city TEXT,
      billing_address_line1 TEXT,
      billing_address_line2 TEXT,
      billing_contact_no TEXT,
      billing_email TEXT,
      billing_alternate_contact_no TEXT,
      shipping_country TEXT,
      shipping_state TEXT,
      shipping_city TEXT,
      shipping_address_line1 TEXT,
      shipping_address_line2 TEXT,
      shipping_contact_no TEXT,
      shipping_email TEXT,
      shipping_alternate_contact_no TEXT,
      balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      item_name TEXT NOT NULL,
      item_description TEXT,
      hsn_code TEXT NOT NULL,
      qty_available TEXT NOT NULL,
      rate TEXT NOT NULL,
      unit TEXT NOT NULL CHECK(unit IN ('kg', 'meter', 'piece', 'litre', 'bundle', 'RFT')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL UNIQUE,
      invoice_date TEXT NOT NULL,
      due_date TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'paid', 'overdue')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS archives (
      id TEXT PRIMARY KEY,
      original_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      due_date TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'paid', 'overdue')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dealers (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      bill_number TEXT NOT NULL,
      bill_date TEXT NOT NULL,
      bill_amount_total REAL NOT NULL,
      payment_mode TEXT NOT NULL CHECK(payment_mode IN ('cash', 'neft', 'imps', 'upi')),
      reference_number TEXT,
      payment_status TEXT NOT NULL CHECK(payment_status IN ('paid', 'unpaid', 'partial_paid')),
      paid_amount REAL DEFAULT 0,
      balance_amount REAL DEFAULT 0,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);
    CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
    CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);
    CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
    CREATE INDEX IF NOT EXISTS idx_archives_original_id ON archives(original_id);
    CREATE INDEX IF NOT EXISTS idx_archives_archived_at ON archives(archived_at);
    CREATE INDEX IF NOT EXISTS idx_dealers_company_id ON dealers(company_id);
    CREATE INDEX IF NOT EXISTS idx_dealers_client_id ON dealers(client_id);
    CREATE INDEX IF NOT EXISTS idx_dealers_bill_date ON dealers(bill_date);
    CREATE TABLE IF NOT EXISTS dealer_archives (
      id TEXT PRIMARY KEY,
      original_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      bill_number TEXT NOT NULL,
      bill_date TEXT NOT NULL,
      bill_amount_total REAL NOT NULL,
      payment_mode TEXT NOT NULL CHECK(payment_mode IN ('cash', 'neft', 'imps', 'upi')),
      reference_number TEXT,
      payment_status TEXT NOT NULL CHECK(payment_status IN ('paid', 'unpaid', 'partial_paid')),
      paid_amount REAL DEFAULT 0,
      balance_amount REAL DEFAULT 0,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_dealer_archives_original_id ON dealer_archives(original_id);
    CREATE INDEX IF NOT EXISTS idx_dealer_archives_archived_at ON dealer_archives(archived_at);
  `);
};

const getDatabase = () => {
  if (!db) {
    return initializeDatabase();
  }
  return db;
};

const getSqliteDatabase = () => {
  if (!sqliteDb) {
    initializeDatabase();
  }
  return sqliteDb;
};

const closeDatabase = () => {
  if (sqliteDb) {
    try {
      sqliteDb.pragma("wal_checkpoint(FULL)");
    } catch (error) {
      console.error("Error checkpointing WAL:", error);
    }
    sqliteDb.close();
    sqliteDb = null;
    db = null;
  }
};

module.exports = {
  initializeDatabase,
  getDatabase,
  getSqliteDatabase,
  closeDatabase,
  getDbPath,
  schema: { companies, clients, items, invoices, archives, dealers, dealerArchives },
};
