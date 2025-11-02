export interface TaxConfig {
  cgst: number;
  sgst: number;
  igst: number;
  cess?: number;
}

export interface InvoiceItem {
  quantity: number;
  rate: number;
  taxRate: number;
}

export interface TaxBreakdown {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total: number;
}

export class TaxCalculator {
  static calculateItemTax(
    quantity: number,
    rate: number,
    taxRate: number,
    isInterState: boolean
  ): { amount: number; taxAmount: number; cgst: number; sgst: number; igst: number } {
    const amount = quantity * rate;
    const taxAmount = (amount * taxRate) / 100;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = taxAmount;
    } else {
      cgst = taxAmount / 2;
      sgst = taxAmount / 2;
    }

    return { amount, taxAmount, cgst, sgst, igst };
  }

  static calculateInvoiceTax(
    items: InvoiceItem[],
    clientState: string,
    companyState: string
  ): TaxBreakdown {
    const isInterState = clientState !== companyState;

    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    for (const item of items) {
      const { amount, cgst, sgst, igst } = this.calculateItemTax(
        item.quantity,
        item.rate,
        item.taxRate,
        isInterState
      );

      subtotal += amount;
      totalCgst += cgst;
      totalSgst += sgst;
      totalIgst += igst;
    }

    const totalTax = totalCgst + totalSgst + totalIgst;
    const total = subtotal + totalTax;

    return {
      subtotal,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      cess: 0,
      total,
    };
  }
}
