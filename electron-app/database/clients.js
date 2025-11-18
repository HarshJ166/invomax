const { getDatabase, schema } = require("./db");
const { eq, desc } = require("drizzle-orm");
const { clients: clientsTable } = schema;

const mapToClient = (row) => ({
  id: row.id,
  customerType: row.customerType,
  salutation: row.salutation,
  firstName: row.firstName,
  lastName: row.lastName,
  panNumber: row.panNumber,
  companyName: row.companyName,
  currency: row.currency,
  gstApplicable: Boolean(row.gstApplicable),
  gstin: row.gstin,
  stateCode: row.stateCode,
  billingCountry: row.billingCountry,
  billingState: row.billingState,
  billingCity: row.billingCity,
  billingAddressLine1: row.billingAddressLine1,
  billingAddressLine2: row.billingAddressLine2,
  billingContactNo: row.billingContactNo,
  billingEmail: row.billingEmail,
  billingAlternateContactNo: row.billingAlternateContactNo,
  shippingCountry: row.shippingCountry,
  shippingState: row.shippingState,
  shippingCity: row.shippingCity,
  shippingAddressLine1: row.shippingAddressLine1,
  shippingAddressLine2: row.shippingAddressLine2,
  shippingContactNo: row.shippingContactNo,
  shippingEmail: row.shippingEmail,
  shippingAlternateContactNo: row.shippingAlternateContactNo,
  balance: row.balance || 0,
});

const getAllClients = () => {
  const db = getDatabase();
  const rows = db.select().from(clientsTable).orderBy(desc(clientsTable.createdAt)).all();
  return rows.map(mapToClient);
};

const getClientById = (id) => {
  const db = getDatabase();
  const row = db.select().from(clientsTable).where(eq(clientsTable.id, id)).get();
  return row ? mapToClient(row) : null;
};

const createClient = (client) => {
  const db = getDatabase();
  db.insert(clientsTable).values({
    id: client.id,
    customerType: client.customerType,
    salutation: client.salutation || null,
    firstName: client.firstName,
    lastName: client.lastName,
    panNumber: client.panNumber || null,
    companyName: client.companyName || null,
    currency: client.currency || "inr",
    gstApplicable: client.gstApplicable || false,
    gstin: client.gstin || null,
    stateCode: client.stateCode || null,
    billingCountry: client.billingCountry || null,
    billingState: client.billingState || null,
    billingCity: client.billingCity || null,
    billingAddressLine1: client.billingAddressLine1 || null,
    billingAddressLine2: client.billingAddressLine2 || null,
    billingContactNo: client.billingContactNo || null,
    billingEmail: client.billingEmail || null,
    billingAlternateContactNo: client.billingAlternateContactNo || null,
    shippingCountry: client.shippingCountry || null,
    shippingState: client.shippingState || null,
    shippingCity: client.shippingCity || null,
    shippingAddressLine1: client.shippingAddressLine1 || null,
    shippingAddressLine2: client.shippingAddressLine2 || null,
    shippingContactNo: client.shippingContactNo || null,
    shippingEmail: client.shippingEmail || null,
    shippingAlternateContactNo: client.shippingAlternateContactNo || null,
    balance: client.balance || 0,
  }).run();
};

const updateClient = (id, client) => {
  const db = getDatabase();
  db.update(clientsTable)
    .set({
      customerType: client.customerType,
      salutation: client.salutation || null,
      firstName: client.firstName,
      lastName: client.lastName,
      panNumber: client.panNumber || null,
      companyName: client.companyName || null,
      currency: client.currency || "inr",
      gstApplicable: client.gstApplicable || false,
      gstin: client.gstin || null,
      stateCode: client.stateCode || null,
      billingCountry: client.billingCountry || null,
      billingState: client.billingState || null,
      billingCity: client.billingCity || null,
      billingAddressLine1: client.billingAddressLine1 || null,
      billingAddressLine2: client.billingAddressLine2 || null,
      billingContactNo: client.billingContactNo || null,
      billingEmail: client.billingEmail || null,
      billingAlternateContactNo: client.billingAlternateContactNo || null,
      shippingCountry: client.shippingCountry || null,
      shippingState: client.shippingState || null,
      shippingCity: client.shippingCity || null,
      shippingAddressLine1: client.shippingAddressLine1 || null,
      shippingAddressLine2: client.shippingAddressLine2 || null,
      shippingContactNo: client.shippingContactNo || null,
      shippingEmail: client.shippingEmail || null,
      shippingAlternateContactNo: client.shippingAlternateContactNo || null,
      balance: client.balance || 0,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(clientsTable.id, id))
    .run();
};

const deleteClient = (id) => {
  const db = getDatabase();
  db.delete(clientsTable).where(eq(clientsTable.id, id)).run();
};

const setAllClients = (clientsList) => {
  const db = getDatabase();
  const sqliteDb = require("./db").getSqliteDatabase();
  
  const transaction = sqliteDb.transaction(() => {
    db.delete(clientsTable).run();
    
    if (clientsList.length > 0) {
      const values = clientsList.map(client => ({
        id: client.id,
        customerType: client.customerType,
        salutation: client.salutation || null,
        firstName: client.firstName,
        lastName: client.lastName,
        panNumber: client.panNumber || null,
        companyName: client.companyName || null,
        currency: client.currency || "inr",
        gstApplicable: client.gstApplicable || false,
        gstin: client.gstin || null,
        stateCode: client.stateCode || null,
        billingCountry: client.billingCountry || null,
        billingState: client.billingState || null,
        billingCity: client.billingCity || null,
        billingAddressLine1: client.billingAddressLine1 || null,
        billingAddressLine2: client.billingAddressLine2 || null,
        billingContactNo: client.billingContactNo || null,
        billingEmail: client.billingEmail || null,
        billingAlternateContactNo: client.billingAlternateContactNo || null,
        shippingCountry: client.shippingCountry || null,
        shippingState: client.shippingState || null,
        shippingCity: client.shippingCity || null,
        shippingAddressLine1: client.shippingAddressLine1 || null,
        shippingAddressLine2: client.shippingAddressLine2 || null,
        shippingContactNo: client.shippingContactNo || null,
        shippingEmail: client.shippingEmail || null,
        shippingAlternateContactNo: client.shippingAlternateContactNo || null,
        balance: client.balance || 0,
      }));
      
      db.insert(clientsTable).values(values).run();
    }
  });
  
  transaction();
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  setAllClients,
};
