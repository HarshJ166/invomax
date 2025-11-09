import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer, Image } from '@react-pdf/renderer';
import { Invoice, Client, InvoiceItem, Company } from '@prisma/client';
import { TaxCalculator } from '../../shared/tax-calculator/tax-calculator.js';
import { formatAmountInWords } from '../../shared/utils/number-to-words.js';

interface InvoiceWithRelations extends Invoice {
  client: Client;
  company: Company;
  items: InvoiceItem[];
  template?: { name: string } | null;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  companySection: {
    flex: 1,
    marginRight: 10,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  companyDetail: {
    fontSize: 8,
    marginBottom: 2,
  },
  invoiceDetailsTable: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableCellLabel: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    fontSize: 7,
    backgroundColor: '#f0f0f0',
  },
  tableCellValue: {
    flex: 1,
    padding: 4,
    fontSize: 7,
  },
  buyerSection: {
    marginTop: 15,
    marginBottom: 15,
  },
  buyerLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buyerDetails: {
    fontSize: 8,
    marginBottom: 2,
  },
  goodsTable: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  goodsHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  goodsHeaderCell: {
    padding: 5,
    fontSize: 8,
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'center',
  },
  goodsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  goodsCell: {
    padding: 4,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  goodsCellCenter: {
    padding: 4,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'center',
  },
  goodsCellRight: {
    padding: 4,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'right',
  },
  itemDescription: {
    flex: 2.5,
  },
  itemHsn: {
    flex: 1,
  },
  itemQty: {
    flex: 0.8,
  },
  itemRate: {
    flex: 1,
  },
  itemPer: {
    flex: 0.7,
  },
  itemAmount: {
    flex: 1.2,
  },
  batchText: {
    fontSize: 6,
    marginTop: 2,
    paddingLeft: 5,
  },
  taxSummaryRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  taxSummaryLabel: {
    flex: 2.5,
    fontSize: 7,
    paddingLeft: 5,
  },
  taxSummaryValue: {
    flex: 1.2,
    fontSize: 7,
    textAlign: 'right',
    paddingRight: 5,
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
  },
  totalLabel: {
    flex: 2.5,
    fontSize: 8,
    fontWeight: 'bold',
    paddingLeft: 5,
  },
  totalValue: {
    flex: 1.2,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 5,
  },
  amountInWords: {
    marginTop: 10,
    fontSize: 8,
    fontStyle: 'italic',
  },
  taxTable: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#000',
  },
  taxTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  taxTableHeaderCell: {
    padding: 4,
    fontSize: 7,
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'center',
  },
  taxTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  taxTableCell: {
    padding: 4,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'center',
  },
  taxTableCellRight: {
    padding: 4,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'right',
  },
  taxTableCellLeft: {
    padding: 4,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'left',
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
  },
  declaration: {
    flex: 1,
    fontSize: 7,
    marginRight: 20,
  },
  signature: {
    flex: 1,
    textAlign: 'right',
    fontSize: 7,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginTop: 30,
    width: 150,
    marginLeft: 'auto',
  },
  computerGenerated: {
    textAlign: 'center',
    fontSize: 7,
    marginTop: 10,
    fontStyle: 'italic',
  },
  eoe: {
    fontSize: 6,
    marginTop: 2,
  },
});

function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function InvoiceDocument({ invoice }: { invoice: InvoiceWithRelations }): React.ReactElement {
  const subtotal = invoice.items.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalQuantity = invoice.items.reduce((sum, item) => sum + Number(item.quantity), 0);
  
  const clientState = invoice.client.state || '';
  const companyState = invoice.company.state || '';
  const isInterState = clientState !== companyState;
  
  const taxBreakdown = TaxCalculator.calculateInvoiceTax(
    invoice.items.map(item => ({
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      taxRate: Number(item.taxRate),
    })),
    clientState,
    companyState
  );

  const groupedByHsn = invoice.items.reduce((acc, item) => {
    const hsn = item.hsnCode || 'N/A';
    if (!acc[hsn]) {
      acc[hsn] = {
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalTax: 0,
      };
    }
    acc[hsn].taxableValue += Number(item.amount);
    if (isInterState) {
      acc[hsn].igst += (Number(item.amount) * Number(item.taxRate)) / 100;
    } else {
      const taxAmount = (Number(item.amount) * Number(item.taxRate)) / 100;
      acc[hsn].cgst += taxAmount / 2;
      acc[hsn].sgst += taxAmount / 2;
    }
    acc[hsn].totalTax = acc[hsn].cgst + acc[hsn].sgst + acc[hsn].igst;
    return acc;
  }, {} as Record<string, { taxableValue: number; cgst: number; sgst: number; igst: number; totalTax: number }>);

  const hsnEntries = Object.entries(groupedByHsn);
  const taxRate = invoice.items.length > 0 ? Number(invoice.items[0].taxRate) : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Tax Invoice</Text>

        <View style={styles.header}>
          <View style={styles.companySection}>
            {invoice.company.logoUrl && (
              <Image src={invoice.company.logoUrl} style={styles.logo} />
            )}
          <Text style={styles.companyName}>{invoice.company.name}</Text>
            {invoice.company.address && (
              <Text style={styles.companyDetail}>{invoice.company.address}</Text>
            )}
            {invoice.company.gstin && (
              <Text style={styles.companyDetail}>GSTIN/UIN: {invoice.company.gstin}</Text>
            )}
            {invoice.company.state && invoice.company.stateCode && (
              <Text style={styles.companyDetail}>
                State Name: {invoice.company.state}, Code: {invoice.company.stateCode}
              </Text>
            )}
            {invoice.company.email && (
              <Text style={styles.companyDetail}>E-Mail: {invoice.company.email}</Text>
            )}
          </View>

          <View style={styles.invoiceDetailsTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Invoice No.</Text>
              <Text style={styles.tableCellValue}>{invoice.invoiceNo}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>e-Way Bill No.</Text>
              <Text style={styles.tableCellValue}>{invoice.eWayBillNo || ''}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Dated</Text>
              <Text style={styles.tableCellValue}>{formatDate(invoice.date)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Delivery Note</Text>
              <Text style={styles.tableCellValue}>{invoice.deliveryNote || ''}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Mode/Terms of Payment</Text>
              <Text style={styles.tableCellValue}>{invoice.modeTermsOfPayment || ''}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Supplier's Ref.</Text>
              <Text style={styles.tableCellValue}>{invoice.supplierRef || ''}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Other Reference(s)</Text>
              <Text style={styles.tableCellValue}>{invoice.otherReferences || ''}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Buyer's Order No.</Text>
              <Text style={styles.tableCellValue}>{invoice.buyerOrderNo || ''}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Dated</Text>
              <Text style={styles.tableCellValue}>{formatDate(invoice.buyerOrderDate)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Despatch Document No.</Text>
              <Text style={styles.tableCellValue}>{invoice.despatchDocumentNo || ''}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Delivery Note Date</Text>
              <Text style={styles.tableCellValue}>{formatDate(invoice.deliveryNoteDate)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Despatched through</Text>
              <Text style={styles.tableCellValue}>{invoice.despatchedThrough || ''}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellLabel}>Destination</Text>
              <Text style={styles.tableCellValue}>{invoice.destination || ''}</Text>
            </View>
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.tableCellLabel}>Terms of Delivery</Text>
              <Text style={styles.tableCellValue}>{invoice.termsOfDelivery || ''}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buyerSection}>
          <Text style={styles.buyerLabel}>Buyer</Text>
          <Text style={styles.buyerDetails}>Name: {invoice.client.name}</Text>
          {invoice.client.billingAddress && (
            <Text style={styles.buyerDetails}>Address: {invoice.client.billingAddress}</Text>
          )}
          {invoice.client.gstin && (
            <Text style={styles.buyerDetails}>GSTIN/UIN: {invoice.client.gstin}</Text>
          )}
          {invoice.client.state && invoice.client.stateCode && (
            <Text style={styles.buyerDetails}>
              State Name: {invoice.client.state}, Code: {invoice.client.stateCode}
            </Text>
          )}
        </View>

        <View style={styles.goodsTable}>
          <View style={styles.goodsHeader}>
            <Text style={[styles.goodsHeaderCell, styles.itemDescription]}>S. No.</Text>
            <Text style={[styles.goodsHeaderCell, styles.itemDescription]}>Description of Goods</Text>
            <Text style={[styles.goodsHeaderCell, styles.itemHsn]}>HSN/SAC</Text>
            <Text style={[styles.goodsHeaderCell, styles.itemQty]}>Quantity</Text>
            <Text style={[styles.goodsHeaderCell, styles.itemRate]}>Rate</Text>
            <Text style={[styles.goodsHeaderCell, styles.itemPer]}>per</Text>
            <Text style={[styles.goodsHeaderCell, styles.itemAmount]}>Amount</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.goodsRow}>
              <Text style={[styles.goodsCellCenter, styles.itemDescription]}>{index + 1}</Text>
              <View style={[styles.goodsCell, styles.itemDescription]}>
                <Text>{item.name}</Text>
                {item.batch && (
                  <Text style={styles.batchText}>Batch: {item.batch}</Text>
                )}
              </View>
              <Text style={[styles.goodsCellCenter, styles.itemHsn]}>{item.hsnCode || ''}</Text>
              <Text style={[styles.goodsCellRight, styles.itemQty]}>{formatCurrency(Number(item.quantity))} Nos</Text>
              <Text style={[styles.goodsCellRight, styles.itemRate]}>{formatCurrency(Number(item.rate))}</Text>
              <Text style={[styles.goodsCellCenter, styles.itemPer]}>Nos</Text>
              <Text style={[styles.goodsCellRight, styles.itemAmount]}>{formatCurrency(Number(item.amount))}</Text>
            </View>
          ))}

          <View style={styles.taxSummaryRow}>
            <Text style={styles.taxSummaryLabel}></Text>
            <Text style={styles.taxSummaryValue}></Text>
        </View>

          {!isInterState && (
            <>
              <View style={styles.taxSummaryRow}>
                <Text style={styles.taxSummaryLabel}>Output CGST</Text>
                <Text style={styles.taxSummaryValue}>{formatCurrency(taxBreakdown.cgst)}</Text>
              </View>
              <View style={styles.taxSummaryRow}>
                <Text style={styles.taxSummaryLabel}>Output SGST</Text>
                <Text style={styles.taxSummaryValue}>{formatCurrency(taxBreakdown.sgst)}</Text>
              </View>
            </>
          )}

          {isInterState && (
            <View style={styles.taxSummaryRow}>
              <Text style={styles.taxSummaryLabel}>Output IGST</Text>
              <Text style={styles.taxSummaryValue}>{formatCurrency(taxBreakdown.igst)}</Text>
            </View>
          )}

        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={[styles.goodsCellRight, styles.itemQty]}>{formatCurrency(totalQuantity)} Nos</Text>
            <Text style={styles.totalValue}>₹ {formatCurrency(Number(invoice.totalAmount))}</Text>
          </View>
          <View style={styles.taxSummaryRow}>
            <Text style={styles.taxSummaryLabel}></Text>
            <Text style={[styles.taxSummaryValue, styles.eoe]}>E. & O.E</Text>
          </View>
        </View>

        <Text style={styles.amountInWords}>
          Amount Chargeable (in words): {formatAmountInWords(Number(invoice.totalAmount))}
        </Text>

        <View style={styles.taxTable}>
          <View style={styles.taxTableHeader}>
            <Text style={[styles.taxTableHeaderCell, { flex: 1 }]}>HSN/SAC</Text>
            <Text style={[styles.taxTableHeaderCell, { flex: 1.5 }]}>Taxable Value</Text>
            {!isInterState ? (
              <>
                <Text style={[styles.taxTableHeaderCell, { flex: 0.8 }]}>Central Tax</Text>
                <Text style={[styles.taxTableHeaderCell, { flex: 0.8 }]}>State Tax</Text>
              </>
            ) : (
              <Text style={[styles.taxTableHeaderCell, { flex: 1.6 }]}>Integrated Tax</Text>
            )}
            <Text style={[styles.taxTableHeaderCell, { flex: 1, borderRightWidth: 0 }]}>Total Tax Amount</Text>
          </View>
          <View style={styles.taxTableHeader}>
            <Text style={[styles.taxTableHeaderCell, { flex: 1, fontSize: 6 }]}></Text>
            <Text style={[styles.taxTableHeaderCell, { flex: 1.5, fontSize: 6 }]}></Text>
            {!isInterState ? (
              <>
                <View style={{ flex: 0.8, flexDirection: 'row', borderRightWidth: 1, borderRightColor: '#000' }}>
                  <Text style={[styles.taxTableHeaderCell, { flex: 1, fontSize: 6, borderRightWidth: 1 }]}>Rate</Text>
                  <Text style={[styles.taxTableHeaderCell, { flex: 1, fontSize: 6, borderRightWidth: 0 }]}>Amount</Text>
                </View>
                <View style={{ flex: 0.8, flexDirection: 'row', borderRightWidth: 1, borderRightColor: '#000' }}>
                  <Text style={[styles.taxTableHeaderCell, { flex: 1, fontSize: 6, borderRightWidth: 1 }]}>Rate</Text>
                  <Text style={[styles.taxTableHeaderCell, { flex: 1, fontSize: 6, borderRightWidth: 0 }]}>Amount</Text>
                </View>
              </>
            ) : (
              <View style={{ flex: 1.6, flexDirection: 'row', borderRightWidth: 1, borderRightColor: '#000' }}>
                <Text style={[styles.taxTableHeaderCell, { flex: 1, fontSize: 6, borderRightWidth: 1 }]}>Rate</Text>
                <Text style={[styles.taxTableHeaderCell, { flex: 1, fontSize: 6, borderRightWidth: 0 }]}>Amount</Text>
              </View>
            )}
            <Text style={[styles.taxTableHeaderCell, { flex: 1, fontSize: 6, borderRightWidth: 0 }]}></Text>
          </View>

          {hsnEntries.map(([hsn, taxData], index) => (
            <View key={index} style={styles.taxTableRow}>
              <Text style={[styles.taxTableCellLeft, { flex: 1 }]}>{hsn}</Text>
              <Text style={[styles.taxTableCellRight, { flex: 1.5 }]}>{formatCurrency(taxData.taxableValue)}</Text>
              {!isInterState ? (
                <>
                  <Text style={[styles.taxTableCell, { flex: 0.4 }]}>{taxRate / 2}%</Text>
                  <Text style={[styles.taxTableCellRight, { flex: 0.4 }]}>{formatCurrency(taxData.cgst)}</Text>
                  <Text style={[styles.taxTableCell, { flex: 0.4 }]}>{taxRate / 2}%</Text>
                  <Text style={[styles.taxTableCellRight, { flex: 0.4 }]}>{formatCurrency(taxData.sgst)}</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.taxTableCell, { flex: 0.8 }]}>{taxRate}%</Text>
                  <Text style={[styles.taxTableCellRight, { flex: 0.8 }]}>{formatCurrency(taxData.igst)}</Text>
                </>
              )}
              <Text style={[styles.taxTableCellRight, { flex: 1, borderRightWidth: 0 }]}>
                {formatCurrency(taxData.totalTax)}
              </Text>
            </View>
          ))}

          <View style={[styles.taxTableRow, { backgroundColor: '#f0f0f0' }]}>
            <Text style={[styles.taxTableCellLeft, { flex: 1, fontWeight: 'bold' }]}>Total</Text>
            <Text style={[styles.taxTableCellRight, { flex: 1.5, fontWeight: 'bold' }]}>
              {formatCurrency(subtotal)}
            </Text>
            {!isInterState ? (
              <>
                <Text style={[styles.taxTableCell, { flex: 0.4 }]}></Text>
                <Text style={[styles.taxTableCellRight, { flex: 0.4, fontWeight: 'bold' }]}>
                  {formatCurrency(taxBreakdown.cgst)}
                </Text>
                <Text style={[styles.taxTableCell, { flex: 0.4 }]}></Text>
                <Text style={[styles.taxTableCellRight, { flex: 0.4, fontWeight: 'bold' }]}>
                  {formatCurrency(taxBreakdown.sgst)}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.taxTableCell, { flex: 0.8 }]}></Text>
                <Text style={[styles.taxTableCellRight, { flex: 0.8, fontWeight: 'bold' }]}>
                  {formatCurrency(taxBreakdown.igst)}
                </Text>
              </>
            )}
            <Text style={[styles.taxTableCellRight, { flex: 1, borderRightWidth: 0, fontWeight: 'bold' }]}>
              {formatCurrency(taxBreakdown.cgst + taxBreakdown.sgst + taxBreakdown.igst)}
            </Text>
          </View>
        </View>

        <Text style={styles.amountInWords}>
          Tax Amount (in words): {formatAmountInWords(taxBreakdown.cgst + taxBreakdown.sgst + taxBreakdown.igst)}
        </Text>

        <View style={styles.footer}>
          <View style={styles.declaration}>
            <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>Declaration</Text>
            <Text>
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
            </Text>
          </View>
          <View style={styles.signature}>
            <Text>for {invoice.company.name}</Text>
            <View style={styles.signatureLine}></View>
            <Text style={{ marginTop: 5 }}>Authorised Signatory</Text>
          </View>
        </View>

        <Text style={styles.computerGenerated}>This is a Computer Generated Invoice</Text>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDFBuffer(invoice: InvoiceWithRelations): Promise<Buffer> {
  const pdfDocument = React.createElement(InvoiceDocument, { invoice });
  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}
