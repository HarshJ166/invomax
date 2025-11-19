import { CompanyFormData } from "@/components/molecules/CompaniesDialog/CompaniesDialog";
import { ItemFormData } from "@/components/molecules/ItemDialog/ItemDialog";
import { ClientFormData } from "@/components/molecules/ClientsDialog/ClientsDialog";

export interface Company extends CompanyFormData {
  id: string;
  revenueTotal: number;
  debt: number;
  invoiceCount: number;
}

export interface Item extends ItemFormData {
  id: string;
}

export interface Client extends ClientFormData {
  id: string;
  balance: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  items: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealerPayment {
  id: string;
  companyId: string;
  clientId: string;
  billNumber: string;
  billDate: string;
  billAmountTotal: number;
  paymentMode: "cash" | "neft" | "imps" | "upi";
  referenceNumber: string | null;
  paymentStatus: "paid" | "unpaid" | "partial_paid";
  paidAmount: number;
  balanceAmount: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

