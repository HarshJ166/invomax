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

