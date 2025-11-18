const { getDatabase } = require("./db");

const getAllCompanies = () => {
  const db = getDatabase();
  const rows = db.prepare("SELECT * FROM companies ORDER BY created_at DESC").all();
  return rows.map(row => ({
    id: row.id,
    companyName: row.company_name,
    proprietor: row.proprietor,
    address: row.address,
    email: row.email,
    phoneNumber: row.phone_number,
    state: row.state,
    city: row.city,
    gstNumber: row.gst_number,
    invoiceNumberInitial: row.invoice_number_initial,
    logo: row.logo,
    logoPreview: row.logo,
    signature: row.signature,
    signaturePreview: row.signature,
    accountNumber: row.account_number,
    bankName: row.bank_name,
    ifscCode: row.ifsc_code,
    branch: row.branch,
    revenueTotal: row.revenue_total,
    debt: row.debt,
    invoiceCount: row.invoice_count,
  }));
};

const getCompanyById = (id) => {
  const db = getDatabase();
  const row = db.prepare("SELECT * FROM companies WHERE id = ?").get(id);
  if (!row) return null;
  
  return {
    id: row.id,
    companyName: row.company_name,
    proprietor: row.proprietor,
    address: row.address,
    email: row.email,
    phoneNumber: row.phone_number,
    state: row.state,
    city: row.city,
    gstNumber: row.gst_number,
    invoiceNumberInitial: row.invoice_number_initial,
    logo: row.logo,
    logoPreview: row.logo,
    signature: row.signature,
    signaturePreview: row.signature,
    accountNumber: row.account_number,
    bankName: row.bank_name,
    ifscCode: row.ifsc_code,
    branch: row.branch,
    revenueTotal: row.revenue_total,
    debt: row.debt,
    invoiceCount: row.invoice_count,
  };
};

const createCompany = (company) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO companies (
      id, company_name, proprietor, address, email, phone_number,
      state, city, gst_number, invoice_number_initial,
      logo, signature, account_number, bank_name, ifsc_code, branch,
      revenue_total, debt, invoice_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    company.id,
    company.companyName,
    company.proprietor,
    company.address,
    company.email,
    company.phoneNumber,
    company.state,
    company.city,
    company.gstNumber,
    company.invoiceNumberInitial,
    company.logoPreview || null,
    company.signaturePreview || null,
    company.accountNumber,
    company.bankName,
    company.ifscCode,
    company.branch,
    company.revenueTotal || 0,
    company.debt || 0,
    company.invoiceCount || 0
  );
};

const updateCompany = (id, company) => {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE companies SET
      company_name = ?, proprietor = ?, address = ?, email = ?,
      phone_number = ?, state = ?, city = ?, gst_number = ?,
      invoice_number_initial = ?, logo = ?, signature = ?,
      account_number = ?, bank_name = ?, ifsc_code = ?, branch = ?,
      revenue_total = ?, debt = ?, invoice_count = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(
    company.companyName,
    company.proprietor,
    company.address,
    company.email,
    company.phoneNumber,
    company.state,
    company.city,
    company.gstNumber,
    company.invoiceNumberInitial,
    company.logoPreview || null,
    company.signaturePreview || null,
    company.accountNumber,
    company.bankName,
    company.ifscCode,
    company.branch,
    company.revenueTotal || 0,
    company.debt || 0,
    company.invoiceCount || 0,
    id
  );
};

const deleteCompany = (id) => {
  const db = getDatabase();
  db.prepare("DELETE FROM companies WHERE id = ?").run(id);
};

const setAllCompanies = (companies) => {
  const db = getDatabase();
  const transaction = db.transaction((companies) => {
    db.prepare("DELETE FROM companies").run();
    const stmt = db.prepare(`
      INSERT INTO companies (
        id, company_name, proprietor, address, email, phone_number,
        state, city, gst_number, invoice_number_initial,
        logo, signature, account_number, bank_name, ifsc_code, branch,
        revenue_total, debt, invoice_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const company of companies) {
      stmt.run(
        company.id,
        company.companyName,
        company.proprietor,
        company.address,
        company.email,
        company.phoneNumber,
        company.state,
        company.city,
        company.gstNumber,
        company.invoiceNumberInitial,
        company.logoPreview || null,
        company.signaturePreview || null,
        company.accountNumber,
        company.bankName,
        company.ifscCode,
        company.branch,
        company.revenueTotal || 0,
        company.debt || 0,
        company.invoiceCount || 0
      );
    }
  });
  
  transaction(companies);
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  setAllCompanies,
};

