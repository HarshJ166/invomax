import React from "react";
import { Invoice, Company, Client } from "@/lib/types";
import { numberToWords } from "@/lib/number-to-words";

// Define types for parsed items
interface InvoiceItem {
  id: string;
  serialNumber: number;
  itemId: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  per: string;
  amount: number;
  batch?: string;
}

interface InvoiceNotes {
  deliveryNote?: string;
  modeOfPayment?: string;
  supplierReference?: string;
  buyerOrderNumber?: string;
  destination?: string;
  gstSlab?: string;
  declaration?: string;
  [key: string]: unknown;
}

interface TaxDetail {
  hsnCode: string;
  taxableValue: number;
  centralTaxRate: number;
  centralTaxAmount: number;
  stateTaxRate: number;
  stateTaxAmount: number;
  totalTaxAmount: number;
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "9pt",
    lineHeight: 1.2,
    padding: "30pt",
    display: "flex",
    flexDirection: "column",
    width: "100%", // Content fills the PDF margin area
    height: "100%",
    boxSizing: "border-box",
    pageBreakAfter: "always",
    position: "relative",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    paddingBottom: "5pt",
    marginBottom: "5pt",
    minHeight: "120pt",
  },
  companySection: {
    width: "50%",
    paddingRight: "10pt",
    borderRight: "1pt solid #000",
  },
  invoiceDetailsSection: {
    width: "50%",
    paddingLeft: "10pt",
  },
  logo: {
    width: "60pt",
    height: "60pt",
    marginBottom: "5pt",
    objectFit: "contain",
  },
  companyName: {
    fontSize: "12pt",
    fontWeight: "bold",
    marginBottom: "2pt",
  },
  companyAddress: {
    fontSize: "9pt",
    marginBottom: "2pt",
  },
  detailsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: "50%",
    marginBottom: "2pt",
  },
  bold: {
    fontWeight: "bold",
  },
  buyerContainer: {
    borderTop: "1pt solid #000",
    borderBottom: "1pt solid #000",
    display: "flex",
    flexDirection: "row",
    marginBottom: "0",
  },
  buyerSection: {
    width: "50%",
    padding: "5pt",
    borderRight: "1pt solid #000",
  },
  deliverySection: {
    width: "50%",
    padding: "5pt",
  },
  sectionTitle: {
    fontSize: "9pt",
    color: "#555",
    marginBottom: "2pt",
  },
  tableContainer: {
    marginTop: "10pt",
    border: "1pt solid #000",
    borderBottom: "none", // Rows have bottom borders
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    backgroundColor: "#f0f0f0",
    minHeight: "25pt",
    alignItems: "center",
    fontWeight: "bold",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    minHeight: "20pt",
    alignItems: "center",
  },
  // Columns
  colSn: {
    width: "5%",
    textAlign: "center",
    borderRight: "1pt solid #000",
    height: "100%",
    padding: "2pt",
  },
  colDesc: {
    width: "40%",
    textAlign: "left",
    borderRight: "1pt solid #000",
    height: "100%",
    padding: "2pt",
  },
  colHsn: {
    width: "10%",
    textAlign: "center",
    borderRight: "1pt solid #000",
    height: "100%",
    padding: "2pt",
  },
  colQty: {
    width: "10%",
    textAlign: "center",
    borderRight: "1pt solid #000",
    height: "100%",
    padding: "2pt",
  },
  colRate: {
    width: "12%",
    textAlign: "right",
    borderRight: "1pt solid #000",
    height: "100%",
    padding: "2pt",
  },
  colPer: {
    width: "8%",
    textAlign: "center",
    borderRight: "1pt solid #000",
    height: "100%",
    padding: "2pt",
  },
  colAmount: {
    width: "15%",
    textAlign: "right",
    height: "100%",
    padding: "2pt",
  },

  footerContainer: {
    marginTop: "auto",
    borderTop: "1pt solid #000",
  },
  totalRow: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    minHeight: "20pt",
    alignItems: "center",
  },
  amountInWords: {
    padding: "5pt",
    borderBottom: "1pt solid #000",
    fontStyle: "italic",
  },
  taxTable: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1pt solid #000",
  },
  taxCol: {
    borderRight: "1pt solid #000",
    padding: "2pt",
    textAlign: "right",
  },
  taxTableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    minHeight: "20pt",
    alignItems: "center",
  },
  taxTableHeader: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    backgroundColor: "#f0f0f0",
    minHeight: "25pt",
    alignItems: "center",
    fontWeight: "bold",
  },
  declarationSection: {
    display: "flex",
    flexDirection: "row",
    minHeight: "80pt",
  },
  declarationText: {
    width: "60%",
    padding: "5pt",
    fontSize: "8pt",
    borderRight: "1pt solid #000",
  },
  signatureSection: {
    width: "40%",
    padding: "5pt",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  signatureImage: {
    height: "40pt",
    objectFit: "contain",
  },
  footerNote: {
    marginTop: "auto",
    paddingTop: "10pt",
    borderTop: "none",
    textAlign: "center",
    color: "#888",
    fontSize: "8pt",
  },
};

interface InvoicePDFProps {
  invoice: Invoice;
  company: Company;
  client: Client;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({
  invoice,
  company,
  client,
}) => {
  const items: InvoiceItem[] = invoice.items ? JSON.parse(invoice.items) : [];

  let notes: InvoiceNotes = {};
  try {
    notes = invoice.notes ? JSON.parse(invoice.notes) : {};
  } catch (e) {
    console.error("Failed to parse invoice notes:", e);
  }

  const calculateTaxDetails = (): TaxDetail[] => {
    const taxDetailsMap = new Map<string, TaxDetail>();

    items.forEach((item) => {
      if (item.hsnCode && item.amount > 0) {
        const existing = taxDetailsMap.get(item.hsnCode) || {
          hsnCode: item.hsnCode,
          taxableValue: 0,
          centralTaxRate: 0,
          centralTaxAmount: 0,
          stateTaxRate: 0,
          stateTaxAmount: 0,
          totalTaxAmount: 0,
        };

        existing.taxableValue += item.amount;
        taxDetailsMap.set(item.hsnCode, existing);
      }
    });

    if (notes.gstSlab && notes.gstSlab !== "") {
      const gstRate = parseFloat(notes.gstSlab);
      const cgstRate = gstRate / 2;
      const sgstRate = gstRate / 2;

      taxDetailsMap.forEach((detail) => {
        detail.centralTaxRate = cgstRate;
        detail.stateTaxRate = sgstRate;
        detail.centralTaxAmount = (detail.taxableValue * cgstRate) / 100;
        detail.stateTaxAmount = (detail.taxableValue * sgstRate) / 100;
        detail.totalTaxAmount = detail.centralTaxAmount + detail.stateTaxAmount;
      });
    }

    return Array.from(taxDetailsMap.values());
  };

  const taxDetails = calculateTaxDetails();

  const ITEMS_PER_PAGE_1 = 7;
  const ITEMS_PER_PAGE_REST = 15;

  const pages = [];
  pages.push(items.slice(0, ITEMS_PER_PAGE_1));

  let remaining = items.slice(ITEMS_PER_PAGE_1);
  while (remaining.length > 0) {
    pages.push(remaining.slice(0, ITEMS_PER_PAGE_REST));
    remaining = remaining.slice(ITEMS_PER_PAGE_REST);
  }

  const InvoiceHeader = () => (
    <div style={styles.headerContainer}>
      <div style={styles.companySection}>
        {company.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.logo} style={styles.logo} alt="Logo" />
        )}
        <div style={styles.companyName}>{company.companyName}</div>
        <div style={styles.companyAddress}>{company.address}</div>
        <div style={styles.companyAddress}>
          {company.city}, {company.state}
        </div>
        <div style={styles.companyAddress}>Email: {company.email}</div>
        <div style={styles.companyAddress}>GSTIN: {company.gstNumber}</div>
      </div>

      <div style={styles.invoiceDetailsSection}>
        <div
          style={{ fontSize: "14pt", fontWeight: "bold", marginBottom: "5pt" }}
        >
          {company.gstNumber ? "Tax Invoice" : "Estimate/Bill of Supply"}
        </div>
        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span>Invoice No: </span>
            <span style={styles.bold}>{invoice.invoiceNumber}</span>
          </div>
          <div style={styles.detailItem}>
            <span>Dated: </span>
            <span style={styles.bold}>{invoice.invoiceDate}</span>
          </div>
          <div style={styles.detailItem}>
            <span>Delivery Note: </span>
            <span>{notes.deliveryNote || "-"}</span>
          </div>
          <div style={styles.detailItem}>
            <span>Mode/Terms of Payment: </span>
            <span>{notes.modeOfPayment || "-"}</span>
          </div>
          <div style={styles.detailItem}>
            <span>Supplier&apos;s Ref: </span>
            <span>{notes.supplierReference || "-"}</span>
          </div>
          {/* Placeholder fields */}
          <div style={styles.detailItem}>
            <span>Other Reference(s): </span>
            <span>-</span>
          </div>
          <div style={styles.detailItem}>
            <span>Buyer&apos;s Order No.: </span>
            <span>{notes.buyerOrderNumber || "-"}</span>
          </div>
          <div style={styles.detailItem}>
            <span>Dated: </span>
            <span>-</span>
          </div>
          <div style={styles.detailItem}>
            <span>Despatch Document No.: </span>
            <span>-</span>
          </div>
          <div style={styles.detailItem}>
            <span>Delivery Note Date: </span>
            <span>-</span>
          </div>
          <div style={styles.detailItem}>
            <span>Despatched through: </span>
            <span>-</span>
          </div>
          <div style={styles.detailItem}>
            <span>Destination: </span>
            <span>{notes.destination || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const BuyerDetails = () => (
    <div style={styles.buyerContainer}>
      <div style={styles.buyerSection}>
        <div style={styles.sectionTitle}>Buyer (Bill to)</div>
        <div style={styles.bold}>
          {client.companyName || `${client.firstName} ${client.lastName}`}
        </div>
        <div>{client.billingAddressLine1}</div>
        <div>
          {client.billingCity}, {client.billingState}
        </div>
        <div>GSTIN: {client.gstin}</div>
      </div>
      <div style={styles.deliverySection}>
        <div style={styles.sectionTitle}>Consignee (Ship to)</div>
        <div style={styles.bold}>
          {client.companyName || `${client.firstName} ${client.lastName}`}
        </div>
        <div>{client.shippingAddressLine1 || client.billingAddressLine1}</div>
        <div>
          {client.shippingCity || client.billingCity},{" "}
          {client.shippingState || client.billingState}
        </div>
      </div>
    </div>
  );

  const TableHeader = () => (
    <div style={styles.tableHeader}>
      <div style={styles.colSn}>S.No</div>
      <div style={styles.colDesc}>Description of Goods</div>
      <div style={styles.colHsn}>HSN/SAC</div>
      <div style={styles.colQty}>Quantity</div>
      <div style={styles.colRate}>Rate</div>
      <div style={styles.colPer}>Per</div>
      <div style={styles.colAmount}>Amount</div>
    </div>
  );

  return (
    <>
      {pages.map((pageItems, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;

        return (
          <div key={pageIndex} style={styles.page}>
            <InvoiceHeader />
            {pageIndex === 0 && <BuyerDetails />}

            <div style={styles.tableContainer}>
              <TableHeader />
              {pageItems.map((item, idx) => (
                <div key={idx} style={styles.tableRow}>
                  <div style={styles.colSn}>{item.serialNumber || idx + 1}</div>
                  <div style={styles.colDesc}>
                    <div style={styles.bold}>{item.description}</div>
                    {item.batch && (
                      <div style={{ fontSize: "8pt", fontStyle: "italic" }}>
                        Batch: {item.batch}
                      </div>
                    )}
                  </div>
                  <div style={styles.colHsn}>{item.hsnCode}</div>
                  <div style={styles.colQty}>{item.quantity}</div>
                  <div style={styles.colRate}>{item.rate.toFixed(2)}</div>
                  <div style={styles.colPer}>{item.unit}</div>
                  <div style={styles.colAmount}>{item.amount.toFixed(2)}</div>
                </div>
              ))}
              {/* Fill empty rows if needed? CSS handles height naturally */}
            </div>

            {isLastPage && (
              <div
                style={{
                  marginTop: "0",
                  borderLeft: "1pt solid #000",
                  borderRight: "1pt solid #000",
                  borderBottom: "1pt solid #000",
                }}
              >
                <div style={styles.totalRow}>
                  <div style={{ ...styles.colSn, borderRight: "none" }}></div>
                  <div
                    style={{
                      ...styles.colDesc,
                      borderRight: "none",
                      textAlign: "right",
                      paddingRight: "5pt",
                    }}
                  >
                    Total
                  </div>
                  <div style={{ ...styles.colHsn, borderRight: "none" }}></div>
                  <div style={styles.colQty}>
                    {items.reduce((acc, i) => acc + i.quantity, 0)}
                  </div>
                  <div style={{ ...styles.colRate, borderRight: "none" }}></div>
                  <div style={{ ...styles.colPer, borderRight: "none" }}></div>
                  <div style={styles.colAmount}>
                    {invoice.subtotal.toFixed(2)}
                  </div>
                </div>

                {company.gstNumber &&
                  notes.gstSlab &&
                  notes.gstSlab !== "" &&
                  taxDetails.length > 0 && (
                    <>
                      <div
                        style={{ borderTop: "1pt solid #000", padding: "5pt" }}
                      >
                        <div
                          style={{
                            fontSize: "9pt",
                            fontWeight: "bold",
                            marginBottom: "5pt",
                          }}
                        >
                          Tax Details
                        </div>
                        <div
                          style={{
                            border: "1pt solid #000",
                            borderBottom: "none",
                          }}
                        >
                          <div style={styles.taxTableHeader}>
                            <div
                              style={{
                                ...styles.taxCol,
                                textAlign: "left",
                                flex: "0 0 20%",
                              }}
                            >
                              HSN/SAC
                            </div>
                            <div style={{ ...styles.taxCol, flex: "0 0 20%" }}>
                              Taxable Value
                            </div>
                            <div style={{ ...styles.taxCol, flex: "0 0 15%" }}>
                              Central Tax Rate
                            </div>
                            <div style={{ ...styles.taxCol, flex: "0 0 15%" }}>
                              Central Tax Amount
                            </div>
                            <div style={{ ...styles.taxCol, flex: "0 0 15%" }}>
                              State Tax Rate
                            </div>
                            <div
                              style={{
                                ...styles.taxCol,
                                flex: "0 0 15%",
                                borderRight: "none",
                              }}
                            >
                              State Tax Amount
                            </div>
                          </div>
                          {taxDetails.map((detail, idx) => (
                            <div key={idx} style={styles.taxTableRow}>
                              <div
                                style={{
                                  ...styles.taxCol,
                                  textAlign: "left",
                                  flex: "0 0 20%",
                                }}
                              >
                                {detail.hsnCode}
                              </div>
                              <div
                                style={{ ...styles.taxCol, flex: "0 0 20%" }}
                              >
                                {detail.taxableValue.toFixed(2)}
                              </div>
                              <div
                                style={{ ...styles.taxCol, flex: "0 0 15%" }}
                              >
                                {detail.centralTaxRate}%
                              </div>
                              <div
                                style={{ ...styles.taxCol, flex: "0 0 15%" }}
                              >
                                {detail.centralTaxAmount.toFixed(2)}
                              </div>
                              <div
                                style={{ ...styles.taxCol, flex: "0 0 15%" }}
                              >
                                {detail.stateTaxRate}%
                              </div>
                              <div
                                style={{
                                  ...styles.taxCol,
                                  flex: "0 0 15%",
                                  borderRight: "none",
                                }}
                              >
                                {detail.stateTaxAmount.toFixed(2)}
                              </div>
                            </div>
                          ))}
                          <div
                            style={{
                              ...styles.taxTableRow,
                              fontWeight: "bold",
                              borderBottom: "none",
                            }}
                          >
                            <div
                              style={{
                                ...styles.taxCol,
                                textAlign: "left",
                                flex: "0 0 20%",
                              }}
                            >
                              Total
                            </div>
                            <div style={{ ...styles.taxCol, flex: "0 0 20%" }}>
                              {invoice.subtotal.toFixed(2)}
                            </div>
                            <div style={{ ...styles.taxCol, flex: "0 0 15%" }}>
                              -
                            </div>
                            <div style={{ ...styles.taxCol, flex: "0 0 15%" }}>
                              {(invoice.taxAmount / 2).toFixed(2)}
                            </div>
                            <div style={{ ...styles.taxCol, flex: "0 0 15%" }}>
                              -
                            </div>
                            <div
                              style={{
                                ...styles.taxCol,
                                flex: "0 0 15%",
                                borderRight: "none",
                              }}
                            >
                              {(invoice.taxAmount / 2).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                <div style={styles.amountInWords}>
                  Amount Chargeable (in words):{" "}
                  {numberToWords(invoice.totalAmount)}
                </div>

                {company.gstNumber && invoice.taxAmount > 0 && (
                  <div style={{ borderTop: "1pt solid #000", padding: "5pt" }}>
                    <div>
                      Tax Amount (in words): {numberToWords(invoice.taxAmount)}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    ...styles.declarationSection,
                    borderTop: "1pt solid #000",
                  }}
                >
                  <div style={styles.declarationText}>
                    <div
                      style={{
                        textDecoration: "underline",
                        marginBottom: "5pt",
                      }}
                    >
                      Declaration:
                    </div>
                    <div>
                      {notes.declaration ||
                        "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct."}
                    </div>
                  </div>
                  <div style={styles.signatureSection}>
                    <div style={{ fontSize: "8pt", textAlign: "right" }}>
                      For {company.companyName}
                    </div>
                    {company.signature && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={company.signature}
                        style={styles.signatureImage}
                        alt="Signature"
                      />
                    )}
                    <div style={{ fontSize: "8pt", textAlign: "right" }}>
                      Authorised Signatory
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={styles.footerNote}>
              This is a Computer Generated Invoice
            </div>
          </div>
        );
      })}
    </>
  );
};

export default InvoicePDF;
