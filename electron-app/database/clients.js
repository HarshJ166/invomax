const { getDatabase } = require("./db");

const getAllClients = () => {
  const db = getDatabase();
  const rows = db.prepare("SELECT * FROM clients ORDER BY created_at DESC").all();
  return rows.map(row => ({
    id: row.id,
    customerType: row.customer_type,
    salutation: row.salutation,
    firstName: row.first_name,
    lastName: row.last_name,
    panNumber: row.pan_number,
    companyName: row.company_name,
    currency: row.currency,
    gstApplicable: Boolean(row.gst_applicable),
    gstin: row.gstin,
    stateCode: row.state_code,
    billingCountry: row.billing_country,
    billingState: row.billing_state,
    billingCity: row.billing_city,
    billingAddressLine1: row.billing_address_line1,
    billingAddressLine2: row.billing_address_line2,
    billingContactNo: row.billing_contact_no,
    billingEmail: row.billing_email,
    billingAlternateContactNo: row.billing_alternate_contact_no,
    shippingCountry: row.shipping_country,
    shippingState: row.shipping_state,
    shippingCity: row.shipping_city,
    shippingAddressLine1: row.shipping_address_line1,
    shippingAddressLine2: row.shipping_address_line2,
    shippingContactNo: row.shipping_contact_no,
    shippingEmail: row.shipping_email,
    shippingAlternateContactNo: row.shipping_alternate_contact_no,
    balance: row.balance,
  }));
};

const getClientById = (id) => {
  const db = getDatabase();
  const row = db.prepare("SELECT * FROM clients WHERE id = ?").get(id);
  if (!row) return null;
  
  return {
    id: row.id,
    customerType: row.customer_type,
    salutation: row.salutation,
    firstName: row.first_name,
    lastName: row.last_name,
    panNumber: row.pan_number,
    companyName: row.company_name,
    currency: row.currency,
    gstApplicable: Boolean(row.gst_applicable),
    gstin: row.gstin,
    stateCode: row.state_code,
    billingCountry: row.billing_country,
    billingState: row.billing_state,
    billingCity: row.billing_city,
    billingAddressLine1: row.billing_address_line1,
    billingAddressLine2: row.billing_address_line2,
    billingContactNo: row.billing_contact_no,
    billingEmail: row.billing_email,
    billingAlternateContactNo: row.billing_alternate_contact_no,
    shippingCountry: row.shipping_country,
    shippingState: row.shipping_state,
    shippingCity: row.shipping_city,
    shippingAddressLine1: row.shipping_address_line1,
    shippingAddressLine2: row.shipping_address_line2,
    shippingContactNo: row.shipping_contact_no,
    shippingEmail: row.shipping_email,
    shippingAlternateContactNo: row.shipping_alternate_contact_no,
    balance: row.balance,
  };
};

const createClient = (client) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO clients (
      id, customer_type, salutation, first_name, last_name, pan_number,
      company_name, currency, gst_applicable, gstin, state_code,
      billing_country, billing_state, billing_city, billing_address_line1,
      billing_address_line2, billing_contact_no, billing_email,
      billing_alternate_contact_no, shipping_country, shipping_state,
      shipping_city, shipping_address_line1, shipping_address_line2,
      shipping_contact_no, shipping_email, shipping_alternate_contact_no,
      balance
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    client.id,
    client.customerType,
    client.salutation || null,
    client.firstName,
    client.lastName,
    client.panNumber || null,
    client.companyName || null,
    client.currency || "inr",
    client.gstApplicable ? 1 : 0,
    client.gstin || null,
    client.stateCode || null,
    client.billingCountry || null,
    client.billingState || null,
    client.billingCity || null,
    client.billingAddressLine1 || null,
    client.billingAddressLine2 || null,
    client.billingContactNo || null,
    client.billingEmail || null,
    client.billingAlternateContactNo || null,
    client.shippingCountry || null,
    client.shippingState || null,
    client.shippingCity || null,
    client.shippingAddressLine1 || null,
    client.shippingAddressLine2 || null,
    client.shippingContactNo || null,
    client.shippingEmail || null,
    client.shippingAlternateContactNo || null,
    client.balance || 0
  );
};

const updateClient = (id, client) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE clients SET
      customer_type = ?, salutation = ?, first_name = ?, last_name = ?,
      pan_number = ?, company_name = ?, currency = ?, gst_applicable = ?,
      gstin = ?, state_code = ?, billing_country = ?, billing_state = ?,
      billing_city = ?, billing_address_line1 = ?, billing_address_line2 = ?,
      billing_contact_no = ?, billing_email = ?, billing_alternate_contact_no = ?,
      shipping_country = ?, shipping_state = ?, shipping_city = ?,
      shipping_address_line1 = ?, shipping_address_line2 = ?,
      shipping_contact_no = ?, shipping_email = ?, shipping_alternate_contact_no = ?,
      balance = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(
    client.customerType,
    client.salutation || null,
    client.firstName,
    client.lastName,
    client.panNumber || null,
    client.companyName || null,
    client.currency || "inr",
    client.gstApplicable ? 1 : 0,
    client.gstin || null,
    client.stateCode || null,
    client.billingCountry || null,
    client.billingState || null,
    client.billingCity || null,
    client.billingAddressLine1 || null,
    client.billingAddressLine2 || null,
    client.billingContactNo || null,
    client.billingEmail || null,
    client.billingAlternateContactNo || null,
    client.shippingCountry || null,
    client.shippingState || null,
    client.shippingCity || null,
    client.shippingAddressLine1 || null,
    client.shippingAddressLine2 || null,
    client.shippingContactNo || null,
    client.shippingEmail || null,
    client.shippingAlternateContactNo || null,
    client.balance || 0,
    id
  );
};

const deleteClient = (id) => {
  const db = getDatabase();
  db.prepare("DELETE FROM clients WHERE id = ?").run(id);
};

const setAllClients = (clients) => {
  const db = getDatabase();
  const transaction = db.transaction((clients) => {
    db.prepare("DELETE FROM clients").run();
    const stmt = db.prepare(`
      INSERT INTO clients (
        id, customer_type, salutation, first_name, last_name, pan_number,
        company_name, currency, gst_applicable, gstin, state_code,
        billing_country, billing_state, billing_city, billing_address_line1,
        billing_address_line2, billing_contact_no, billing_email,
        billing_alternate_contact_no, shipping_country, shipping_state,
        shipping_city, shipping_address_line1, shipping_address_line2,
        shipping_contact_no, shipping_email, shipping_alternate_contact_no,
        balance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const client of clients) {
      stmt.run(
        client.id,
        client.customerType,
        client.salutation || null,
        client.firstName,
        client.lastName,
        client.panNumber || null,
        client.companyName || null,
        client.currency || "inr",
        client.gstApplicable ? 1 : 0,
        client.gstin || null,
        client.stateCode || null,
        client.billingCountry || null,
        client.billingState || null,
        client.billingCity || null,
        client.billingAddressLine1 || null,
        client.billingAddressLine2 || null,
        client.billingContactNo || null,
        client.billingEmail || null,
        client.billingAlternateContactNo || null,
        client.shippingCountry || null,
        client.shippingState || null,
        client.shippingCity || null,
        client.shippingAddressLine1 || null,
        client.shippingAddressLine2 || null,
        client.shippingContactNo || null,
        client.shippingEmail || null,
        client.shippingAlternateContactNo || null,
        client.balance || 0
      );
    }
  });
  
  transaction(clients);
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  setAllClients,
};

