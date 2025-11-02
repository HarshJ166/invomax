import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { Invoice, Client, InvoiceItem, Company } from '@prisma/client';

interface InvoiceWithRelations extends Invoice {
  client: Client;
  company: Company;
  items: InvoiceItem[];
  template?: { name: string } | null;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  totalLabel: {
    fontWeight: 'bold',
    marginRight: 10,
    width: 100,
  },
  totalValue: {
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right',
  },
});

function InvoiceDocument({ invoice }: { invoice: InvoiceWithRelations }): React.ReactElement {
  const subtotal = invoice.items.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalTax = invoice.items.reduce((sum, item) => sum + Number(item.taxAmount), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>{invoice.company.name}</Text>
          {invoice.company.address && <Text style={styles.value}>{invoice.company.address}</Text>}
          {invoice.company.gstin && <Text style={styles.label}>GSTIN: {invoice.company.gstin}</Text>}
        </View>

        <View style={styles.invoiceInfo}>
          <View style={styles.section}>
            <Text style={styles.label}>Bill To:</Text>
            <Text style={styles.value}>{invoice.client.name}</Text>
            {invoice.client.billingAddress && (
              <Text style={styles.value}>{invoice.client.billingAddress}</Text>
            )}
            {invoice.client.gstin && (
              <Text style={styles.label}>GSTIN: {invoice.client.gstin}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Invoice No: {invoice.invoiceNo}</Text>
            <Text style={styles.label}>Date: {new Date(invoice.date).toLocaleDateString()}</Text>
            <Text style={styles.label}>Status: {invoice.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Item</Text>
            <Text style={styles.tableCell}>Qty</Text>
            <Text style={styles.tableCell}>Rate</Text>
            <Text style={styles.tableCell}>Tax %</Text>
            <Text style={styles.tableCell}>Amount</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.quantity.toString()}</Text>
              <Text style={styles.tableCell}>₹{Number(item.rate).toFixed(2)}</Text>
              <Text style={styles.tableCell}>{Number(item.taxRate).toFixed(2)}%</Text>
              <Text style={styles.tableCell}>₹{Number(item.amount).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax:</Text>
          <Text style={styles.totalValue}>₹{totalTax.toFixed(2)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>₹{Number(invoice.totalAmount).toFixed(2)}</Text>
        </View>

        {invoice.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Notes:</Text>
            <Text style={styles.value}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function generateInvoicePDFBuffer(invoice: InvoiceWithRelations): Promise<Buffer> {
  const pdfDocument = React.createElement(InvoiceDocument, { invoice });
  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}
