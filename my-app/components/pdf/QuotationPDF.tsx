import React from "react";
import { Quotation, Company, Client } from "@/lib/types";
import { numberToWords } from "@/lib/number-to-words";

interface QuotationItem {
  id: string;
  serialNumber: number;
  itemId: string;
  description: string;
  hsnCode: string;
  quantity: number;
  rate: number;
  amount: number | null;
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: "10pt",
    lineHeight: 1.4,
    padding: "40pt",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: "20pt",
    borderBottom: "2pt solid #000",
    paddingBottom: "10pt",
  },
  logoSection: {
    width: "20%",
    marginRight: "20pt",
  },
  logo: {
    width: "80pt",
    height: "80pt",
    objectFit: "contain",
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: "16pt",
    fontWeight: "bold",
    marginBottom: "4pt",
    textTransform: "uppercase",
  },
  companyTagline: {
    fontSize: "9pt",
    marginBottom: "4pt",
    fontStyle: "italic",
  },
  companyApproval: {
    fontSize: "9pt",
    marginBottom: "8pt",
    fontWeight: "bold",
  },
  companyAddress: {
    fontSize: "9pt",
    marginBottom: "2pt",
    lineHeight: 1.3,
  },
  companyContact: {
    fontSize: "9pt",
    marginTop: "4pt",
  },
  toSection: {
    marginTop: "15pt",
    marginBottom: "15pt",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  toLeft: {
    flex: 1,
  },
  toLabel: {
    fontSize: "10pt",
    fontWeight: "bold",
    marginBottom: "4pt",
  },
  toContent: {
    fontSize: "10pt",
    marginBottom: "2pt",
  },
  toRight: {
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  dateRow: {
    fontSize: "10pt",
    marginBottom: "8pt",
  },
  dateLabel: {
    fontWeight: "bold",
  },
  quotationIdRow: {
    fontSize: "10pt",
  },
  quotationIdLabel: {
    fontWeight: "bold",
  },
  subjectRow: {
    marginTop: "15pt",
    marginBottom: "10pt",
  },
  subject: {
    fontSize: "11pt",
    fontWeight: "bold",
    textDecoration: "underline",
  },
  salutation: {
    fontSize: "10pt",
    marginBottom: "8pt",
  },
  introText: {
    fontSize: "10pt",
    marginBottom: "15pt",
    lineHeight: 1.5,
  },
  tableContainer: {
    marginTop: "10pt",
    marginBottom: "15pt",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1pt solid #000",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    border: "1pt solid #000",
    padding: "6pt",
    fontSize: "9pt",
  },
  tableCellLeft: {
    textAlign: "left",
  },
  tableCellCenter: {
    textAlign: "center",
  },
  tableCellRight: {
    textAlign: "right",
  },
  totalRow: {
    fontWeight: "bold",
  },
  amountInWords: {
    marginTop: "10pt",
    marginBottom: "15pt",
    fontSize: "10pt",
    fontStyle: "italic",
    textAlign: "left",
  },
  termsSection: {
    marginTop: "15pt",
    marginBottom: "15pt",
    textAlign: "left",
  },
  termsTitle: {
    fontSize: "10pt",
    fontWeight: "bold",
    marginBottom: "4pt",
  },
  termsContent: {
    fontSize: "9pt",
    lineHeight: 1.4,
  },
  closingSection: {
    marginTop: "20pt",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  closingText: {
    fontSize: "10pt",
    marginBottom: "4pt",
  },
  companyNameClosing: {
    fontSize: "10pt",
    fontWeight: "bold",
    marginTop: "8pt",
  },
  signatureSection: {
    marginTop: "15pt",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  signatureImage: {
    height: "40pt",
    objectFit: "contain",
    marginBottom: "4pt",
  },
  propLabel: {
    fontSize: "9pt",
    marginTop: "4pt",
  },
};

interface QuotationPDFProps {
  quotation: Quotation;
  company: Company;
  client: Client | null;
  toPartyName: string | null;
  toPartyAddress: string | null;
}

const QuotationPDF: React.FC<QuotationPDFProps> = ({
  quotation,
  company,
  client,
  toPartyName,
  toPartyAddress,
}) => {
  const items: QuotationItem[] = quotation.items ? JSON.parse(quotation.items) : [];

  const logoUrl =
    company.logoPreview ||
    (typeof company.logo === "string" ? company.logo : null);

  const signatureUrl =
    company.signaturePreview ||
    (typeof company.signature === "string" ? company.signature : null);

  const displayToPartyName = client
    ? client.customerType === "business"
      ? client.companyName || `${client.firstName} ${client.lastName}`
      : `${client.firstName} ${client.lastName}`
    : toPartyName || "";

  const displayToPartyAddress = client
    ? `${client.billingAddressLine1 || ""}${
        client.billingAddressLine2 ? `, ${client.billingAddressLine2}` : ""
      }, ${client.billingCity || ""}, ${client.billingState || ""}`
    : toPartyAddress || "";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        {logoUrl && (
          <div style={styles.logoSection}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} style={styles.logo} alt="Logo" />
          </div>
        )}
        <div style={styles.companyInfo}>
          <div style={styles.companyName}>{company.companyName}</div>
          <div style={styles.companyTagline}>
            (ALL TYPES OF ELECTRICAL AND ENGINEERING WORKS)
          </div>
          <div style={styles.companyApproval}>GOVT. APPROVED CONTRACTOR</div>
          <div style={styles.companyAddress}>{company.address}</div>
          {company.gstNumber && (
            <div style={styles.companyContact}>GST NO.: {company.gstNumber}</div>
          )}
          <div style={styles.companyContact}>EMAIL ID: {company.email}</div>
          <div style={styles.companyContact}>
            Mobile no.: {company.phoneNumber}
          </div>
        </div>
      </div>

      <div style={styles.toSection}>
        <div style={styles.toLeft}>
          <div style={styles.toLabel}>To:</div>
          <div style={styles.toContent}>{displayToPartyName}</div>
          {displayToPartyAddress && (
            <div style={styles.toContent}>{displayToPartyAddress}</div>
          )}
        </div>
        <div style={styles.toRight}>
          <div style={styles.dateRow}>
            <span style={styles.dateLabel}>Date: </span>
            <span>{quotation.quotationDate}</span>
          </div>
          <div style={styles.quotationIdRow}>
            <span style={styles.quotationIdLabel}>Quotation ID: </span>
            <span>{quotation.quotationId}</span>
          </div>
        </div>
      </div>

      <div style={styles.subjectRow}>
        <div style={styles.subject}>Subject: {quotation.subject}</div>
      </div>

      <div style={styles.salutation}>Respected Sir,</div>

      <div style={styles.introText}>
        Thank you for enquiry for the above mentioned subject, hereby providing
        the best possible quotation from our side.
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={{ ...styles.tableCell, ...styles.tableCellCenter }}>
                Sr.No
              </th>
              <th style={{ ...styles.tableCell, ...styles.tableCellLeft }}>
                Particular
              </th>
              <th style={{ ...styles.tableCell, ...styles.tableCellCenter }}>
                HSN
              </th>
              <th style={{ ...styles.tableCell, ...styles.tableCellCenter }}>
                Qty
              </th>
              <th style={{ ...styles.tableCell, ...styles.tableCellRight }}>
                Rate
              </th>
              <th style={{ ...styles.tableCell, ...styles.tableCellRight }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td style={{ ...styles.tableCell, ...styles.tableCellCenter }}>
                  {item.serialNumber || index + 1}
                </td>
                <td style={{ ...styles.tableCell, ...styles.tableCellLeft }}>
                  {item.description}
                </td>
                <td style={{ ...styles.tableCell, ...styles.tableCellCenter }}>
                  {item.hsnCode}
                </td>
                <td style={{ ...styles.tableCell, ...styles.tableCellCenter }}>
                  {item.quantity}
                </td>
                <td style={{ ...styles.tableCell, ...styles.tableCellRight }}>
                  {item.rate.toFixed(2)}
                </td>
                <td style={{ ...styles.tableCell, ...styles.tableCellRight }}>
                  {item.amount !== null ? item.amount.toFixed(2) : "-"}
                </td>
              </tr>
            ))}
            <tr style={styles.totalRow}>
              <td
                colSpan={5}
                style={{ ...styles.tableCell, ...styles.tableCellLeft }}
              >
                Total:-
              </td>
              <td style={{ ...styles.tableCell, ...styles.tableCellRight }}>
                {quotation.totalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={styles.amountInWords}>
        Amount in Words: {numberToWords(quotation.totalAmount)} Only/-
      </div>

      {quotation.termsAndConditions && (
        <div style={styles.termsSection}>
          <div style={styles.termsTitle}>Terms and Conditions :-</div>
          <div style={styles.termsContent}>{quotation.termsAndConditions}</div>
        </div>
      )}

      <div style={styles.closingSection}>
        <div style={styles.closingText}>Hoping For a Favourable Reply</div>
        <div style={styles.closingText}>Thanking You,</div>
        <div style={styles.companyNameClosing}>{company.companyName},</div>
        {signatureUrl && (
          <div style={styles.signatureSection}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signatureUrl} style={styles.signatureImage} alt="Signature" />
          </div>
        )}
        <div style={styles.propLabel}>({company.proprietor})</div>
        <div style={styles.propLabel}>Prop.</div>
      </div>
    </div>
  );
};

export default QuotationPDF;

