const { getDatabase, schema } = require("./db");
const { eq, desc } = require("drizzle-orm");
const { companies: companiesTable } = schema;

const mapToCompany = (row) => ({
  id: row.id,
  companyName: row.companyName,
  proprietor: row.proprietor,
  address: row.address,
  email: row.email,
  phoneNumber: row.phoneNumber,
  state: row.state,
  city: row.city,
  gstNumber: row.gstNumber,
  invoiceNumberInitial: row.invoiceNumberInitial,
  logo: row.logo,
  logoPreview: row.logo,
  signature: row.signature,
  signaturePreview: row.signature,
  accountNumber: row.accountNumber,
  bankName: row.bankName,
  ifscCode: row.ifscCode,
  branch: row.branch,
  revenueTotal: row.revenueTotal || 0,
  debt: row.debt || 0,
  invoiceCount: row.invoiceCount || 0,
});

const getAllCompanies = () => {
  const db = getDatabase();
  const rows = db.select().from(companiesTable).orderBy(desc(companiesTable.createdAt)).all();
  return rows.map(mapToCompany);
};

const getCompanyById = (id) => {
  const db = getDatabase();
  const row = db.select().from(companiesTable).where(eq(companiesTable.id, id)).get();
  return row ? mapToCompany(row) : null;
};

const createCompany = (company) => {
  const db = getDatabase();
  db.insert(companiesTable).values({
    id: company.id,
    companyName: company.companyName,
    proprietor: company.proprietor,
    address: company.address,
    email: company.email,
    phoneNumber: company.phoneNumber,
    state: company.state,
    city: company.city,
    gstNumber: company.gstNumber || "",
    invoiceNumberInitial: company.invoiceNumberInitial,
    logo: company.logoPreview || null,
    signature: company.signaturePreview || null,
    accountNumber: company.accountNumber,
    bankName: company.bankName,
    ifscCode: company.ifscCode,
    branch: company.branch,
    revenueTotal: company.revenueTotal || 0,
    debt: company.debt || 0,
    invoiceCount: company.invoiceCount || 0,
  }).run();
};

const updateCompany = (id, company) => {
  const db = getDatabase();
  db.update(companiesTable)
    .set({
      companyName: company.companyName,
      proprietor: company.proprietor,
      address: company.address,
      email: company.email,
      phoneNumber: company.phoneNumber,
      state: company.state,
      city: company.city,
      gstNumber: company.gstNumber || "",
      invoiceNumberInitial: company.invoiceNumberInitial,
      logo: company.logoPreview || null,
      signature: company.signaturePreview || null,
      accountNumber: company.accountNumber,
      bankName: company.bankName,
      ifscCode: company.ifscCode,
      branch: company.branch,
      revenueTotal: company.revenueTotal || 0,
      debt: company.debt || 0,
      invoiceCount: company.invoiceCount || 0,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(companiesTable.id, id))
    .run();
};

const deleteCompany = (id) => {
  const db = getDatabase();
  db.delete(companiesTable).where(eq(companiesTable.id, id)).run();
};

const setAllCompanies = (companiesList) => {
  const db = getDatabase();
  const sqliteDb = require("./db").getSqliteDatabase();
  
  const transaction = sqliteDb.transaction(() => {
    db.delete(companiesTable).run();
    
    if (companiesList.length > 0) {
      const values = companiesList.map(company => ({
        id: company.id,
        companyName: company.companyName,
        proprietor: company.proprietor,
        address: company.address,
        email: company.email,
        phoneNumber: company.phoneNumber,
        state: company.state,
        city: company.city,
        gstNumber: company.gstNumber,
        invoiceNumberInitial: company.invoiceNumberInitial,
        logo: company.logoPreview || null,
        signature: company.signaturePreview || null,
        accountNumber: company.accountNumber,
        bankName: company.bankName,
        ifscCode: company.ifscCode,
        branch: company.branch,
        revenueTotal: company.revenueTotal || 0,
        debt: company.debt || 0,
        invoiceCount: company.invoiceCount || 0,
      }));
      
      db.insert(companiesTable).values(values).run();
    }
  });
  
  transaction();
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  setAllCompanies,
};
