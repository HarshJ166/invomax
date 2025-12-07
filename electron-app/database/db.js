const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const path = require("path");
const fs = require("fs");
const { app, dialog } = require("electron");
const { companies, clients, items, invoices, archives, dealers, dealerArchives, quotations, purchases } = require("./schema");

// Encapsulate DB State
let sqliteDb = null;
let db = null;
const DB_NAME = "invoicegen.db";

const getDbPath = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // CRITICAL: Use userData for persistence across updates
  const userDataPath = app.getPath("userData");
  const dbFolder = path.join(userDataPath, "database");

  // Ensure directory exists
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
  }

  return path.join(dbFolder, DB_NAME);
};

// Helper to migrate legacy DB to new secure location
const handleFirstRunMigration = (targetPath) => {
  try {
    const legacyPath = path.join(__dirname, "..", DB_NAME); // Old path in app root
    
    // If new DB doesn't exist but legacy does, move it to preserve user data
    if (!fs.existsSync(targetPath) && fs.existsSync(legacyPath)) {
      console.log("Migrating legacy database to userData folder...");
      fs.copyFileSync(legacyPath, targetPath);
      // Optional: Rename legacy file to prevent confusion
      // fs.renameSync(legacyPath, legacyPath + '.bak'); 
    }
  } catch (error) {
    console.error("Failed to migrate legacy database:", error);
    // We don't throw here, as we can still create a fresh DB if migration fails
  }
};

const createBackup = (dbPath) => {
  try {
    if (!fs.existsSync(dbPath)) return null;

    const backupDir = path.join(path.dirname(dbPath), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `${DB_NAME}.${timestamp}.bak`);
    
    // Force checkpoint to ensure WAL data is in the main file
    if (sqliteDb) {
      sqliteDb.pragma("wal_checkpoint(FULL)");
    }

    fs.copyFileSync(dbPath, backupPath);
    console.log(`Database backup created at: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error("Backup failed:", error);
    throw new Error("Failed to create database backup. Update aborted to prevent data loss.");
  }
};

const restoreBackup = (backupPath, targetPath) => {
  try {
    if (sqliteDb && sqliteDb.open) {
      sqliteDb.close();
    }
    fs.copyFileSync(backupPath, targetPath);
    console.log("Database rolled back successfully.");
  } catch (error) {
    console.error("CRITICAL: Failed to rollback database!", error);
  }
};

const runMigrations = (database, dbPath) => {
  // Defines definitions for the "migrations" table itself
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_versions (
      version INTEGER PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Get current version
  const result = database.prepare("SELECT MAX(version) as v FROM schema_versions").get();
  const currentVersion = result.v || 0;

  // DEFINITION OF ALL MIGRATIONS
  const migrations = [
    {
      version: 1,
      up: (db) => {
        console.log("Applying Migration v1: Initial Schema");
        const createTables = db.transaction(() => {
           db.exec(`
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
               unit TEXT NOT NULL CHECK(unit IN ('kg', 'meter', 'piece', 'litre', 'bundle', 'RFT','lumsum')),
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
               image TEXT,
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
               image TEXT,
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

             CREATE TABLE IF NOT EXISTS quotations (
               id TEXT PRIMARY KEY,
               company_id TEXT NOT NULL,
               client_id TEXT,
               to_party_name TEXT,
               to_party_address TEXT,
               quotation_id TEXT NOT NULL UNIQUE,
               subject TEXT NOT NULL,
               quotation_date TEXT NOT NULL,
               items TEXT NOT NULL,
               subtotal REAL NOT NULL,
               total_amount REAL NOT NULL,
               terms_and_conditions TEXT,
               created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
               updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
               FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
             );

             CREATE TABLE IF NOT EXISTS purchases (
               id TEXT PRIMARY KEY,
               item_id TEXT NOT NULL,
               client_id TEXT NOT NULL,
               quantity REAL NOT NULL,
               rate REAL NOT NULL,
               amount REAL NOT NULL,
               date TEXT NOT NULL,
               created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
               updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
               FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
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
             CREATE INDEX IF NOT EXISTS idx_dealer_archives_original_id ON dealer_archives(original_id);
             CREATE INDEX IF NOT EXISTS idx_dealer_archives_archived_at ON dealer_archives(archived_at);
             CREATE INDEX IF NOT EXISTS idx_quotations_company_id ON quotations(company_id);
             CREATE INDEX IF NOT EXISTS idx_quotations_quotation_date ON quotations(quotation_date);
             CREATE INDEX IF NOT EXISTS idx_purchases_item_id ON purchases(item_id);
             CREATE INDEX IF NOT EXISTS idx_purchases_client_id ON purchases(client_id);
             CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date);
           `);
        });
        createTables();
      }
    },
    {
      version: 2,
      up: (db) => {
        console.log("Applying Migration v2: Add Purchases columns");
        const addCols = db.transaction(() => {
          try { 
            db.exec("ALTER TABLE purchases ADD COLUMN invoice_number TEXT;"); 
          } catch(e) {
             // Ignore if already exists (safe for re-runs on partially migrated dbs)
             if (!e.message.includes("duplicate column")) console.log("Note: invoice_number column might already exist");
          }
          try { 
            db.exec("ALTER TABLE purchases ADD COLUMN company_id TEXT;"); 
          } catch(e) {
             if (!e.message.includes("duplicate column")) console.log("Note: company_id column might already exist");
          }
          
          try { db.exec("CREATE INDEX IF NOT EXISTS idx_purchases_invoice_number ON purchases(invoice_number);"); } catch(e) {}
          try { db.exec("CREATE INDEX IF NOT EXISTS idx_purchases_company_id ON purchases(company_id);"); } catch(e) {}
          
          // Add other missing columns from original script
          try { db.exec("ALTER TABLE invoices ADD COLUMN image TEXT;"); } catch(e) {}
          try { db.exec("ALTER TABLE archives ADD COLUMN image TEXT;"); } catch(e) {}
        });
        addCols();
      }
    }
  ];

  const pendingMigrations = migrations.filter(m => m.version > currentVersion);

  if (pendingMigrations.length > 0) {
    console.log(`Found ${pendingMigrations.length} pending migrations.`);
    
    // 5. Create Backup before applying changes
    const backupPath = createBackup(dbPath);

    try {
      for (const migration of pendingMigrations) {
        migration.up(database);
        database.prepare("INSERT INTO schema_versions (version) VALUES (?)").run(migration.version);
        console.log(`Successfully applied migration version ${migration.version}`);
      }
    } catch (error) {
      console.error("Migration failed. Initiating rollback...", error);
      
      // 6. Rollback on failure
      if (backupPath) {
        restoreBackup(backupPath, dbPath);
        // Re-open path after file replacements
        sqliteDb = new Database(dbPath);
        // Be careful: if we re-assign sqliteDb, we must ensure other references are updated. 
        // In this module, we export functions that use the module-level 'sqliteDb' variable, 
        // so re-assigning it is correct.
      }
      throw new Error("Database migration failed and was rolled back. Check logs for details.");
    }
  } else {
    console.log("Database is up to date.");
  }
};

const initializeDatabase = async () => {
  try {
    const dbPath = getDbPath();
    console.log("Initializing database at:", dbPath);
    
    // 1. Check for legacy DB location and move if necessary
    handleFirstRunMigration(dbPath);

    // 2. Open Connection
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma("journal_mode = WAL");
    sqliteDb.pragma("foreign_keys = ON");

    // 3. Initialize Drizzle
    db = drizzle(sqliteDb);

    // 4. Run System Migrations
    runMigrations(sqliteDb, dbPath);

    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    if (dialog) {
        dialog.showErrorBox("Database Error", `Failed to initialize database.\n${error.message}`);
    }
    throw error;
  }
};

const getDatabase = () => {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
};

const getSqliteDatabase = () => {
  if (!sqliteDb) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
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
  schema: { companies, clients, items, invoices, archives, dealers, dealerArchives, quotations, purchases },
};
