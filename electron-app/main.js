require('dotenv').config();
const { app, BrowserWindow, ipcMain } = require('electron');
const { initializeDatabase, closeDatabase } = require('./database/db');
const companiesDb = require('./database/companies');
const clientsDb = require('./database/clients');
const itemsDb = require('./database/items');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  initializeDatabase();
  setupIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  closeDatabase();
});

function setupIpcHandlers() {
  ipcMain.handle('db:getPath', () => {
    const { getDbPath } = require('./database/db');
    return getDbPath();
  });

  ipcMain.handle('db:companies:getAll', () => {
    return companiesDb.getAllCompanies();
  });

  ipcMain.handle('db:companies:create', (_, company) => {
    companiesDb.createCompany(company);
    return { success: true };
  });

  ipcMain.handle('db:companies:update', (_, id, company) => {
    companiesDb.updateCompany(id, company);
    return { success: true };
  });

  ipcMain.handle('db:companies:delete', (_, id) => {
    companiesDb.deleteCompany(id);
    return { success: true };
  });

  ipcMain.handle('db:companies:setAll', (_, companies) => {
    companiesDb.setAllCompanies(companies);
    return { success: true };
  });

  ipcMain.handle('db:clients:getAll', () => {
    return clientsDb.getAllClients();
  });

  ipcMain.handle('db:clients:create', (_, client) => {
    clientsDb.createClient(client);
    return { success: true };
  });

  ipcMain.handle('db:clients:update', (_, id, client) => {
    clientsDb.updateClient(id, client);
    return { success: true };
  });

  ipcMain.handle('db:clients:delete', (_, id) => {
    clientsDb.deleteClient(id);
    return { success: true };
  });

  ipcMain.handle('db:clients:setAll', (_, clients) => {
    clientsDb.setAllClients(clients);
    return { success: true };
  });

  ipcMain.handle('db:items:getAll', () => {
    return itemsDb.getAllItems();
  });

  ipcMain.handle('db:items:create', (_, item) => {
    itemsDb.createItem(item);
    return { success: true };
  });

  ipcMain.handle('db:items:update', (_, id, item) => {
    itemsDb.updateItem(id, item);
    return { success: true };
  });

  ipcMain.handle('db:items:delete', (_, id) => {
    itemsDb.deleteItem(id);
    return { success: true };
  });

  ipcMain.handle('db:items:setAll', (_, items) => {
    itemsDb.setAllItems(items);
    return { success: true };
  });
}
