# Electron App - Invoice Generator

## Folder Structure

```
electron-app/
├── database/           # Database layer
│   ├── db.js          # Database initialization and connection
│   ├── companies.js   # Companies CRUD operations
│   ├── clients.js     # Clients CRUD operations
│   └── items.js       # Items CRUD operations
├── main.js            # Electron main process entry point
├── package.json       # Dependencies and scripts
├── invoicegen.db      # SQLite database file (created automatically)
└── .env               # Environment variables (optional)
```

## Database Configuration

The database file is automatically created at:

```
/Users/harshjajal/Documents/invoice generator/electron-app/invoicegen.db
```

### DATABASE_URL

The application uses `process.env.DATABASE_URL` as the standard method to determine the database path. Create a `.env` file in the `electron-app` directory:

```env
DATABASE_URL=/Users/harshjajal/Documents/invoice generator/electron-app/invoicegen.db
```

**Behavior:**

- If `DATABASE_URL` is set in `.env`, the application will use that path
- If `DATABASE_URL` is not set, it defaults to `{electron-app-dir}/invoicegen.db`
- The database directory will be created automatically if it doesn't exist

**Note:** `better-sqlite3` uses file paths directly, not connection strings. The `DATABASE_URL` should be an absolute file path.

## Database Files

- `invoicegen.db` - Main database file (required)
- `invoicegen.db-wal` - Write-Ahead Logging file (temporary, auto-managed by SQLite)
- `invoicegen.db-shm` - Shared memory file (temporary, auto-managed by SQLite)

The `-wal` and `-shm` files are automatically created and managed by SQLite when using WAL mode. They improve performance and can be safely ignored. They will be automatically cleaned up when the database is properly closed.

## Scripts

- `yarn dev` - Start Next.js dev server and Electron app
- `yarn rebuild` - Rebuild native modules for Electron

## Database Schema

The database includes the following tables:

- `companies` - Company information and bank details
- `clients` - Client information and addresses
- `items` - Product/item catalog
- `invoices` - Invoice records (for future use)
