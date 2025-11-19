"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusIcon, TrashIcon, DownloadIcon, SaveIcon } from "lucide-react";
import { dbService } from "@/lib/db-service";
import { Company, Client, Item } from "@/lib/types";
import {
  CompaniesDialog,
  CompanyFormData,
} from "@/components/molecules/CompaniesDialog/CompaniesDialog";
import {
  ClientsDialog,
  ClientFormData,
} from "@/components/molecules/ClientsDialog/ClientsDialog";
import {
  ItemDialog,
  ItemFormData,
} from "@/components/molecules/ItemDialog/ItemDialog";
import { numberToWords } from "@/lib/number-to-words";

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

interface TaxDetail {
  hsnCode: string;
  taxableValue: number;
  centralTaxRate: number;
  centralTaxAmount: number;
  stateTaxRate: number;
  stateTaxAmount: number;
  totalTaxAmount: number;
}

interface InvoiceFormData {
  companyId: string;
  clientId: string;
  invoiceNumber: string;
  invoiceDate: string;
  deliveryNote: string;
  modeOfPayment: string;
  supplierReference: string;
  destination: string;
  items: InvoiceItem[];
  gstSlab: "18" | "5" | "";
  declaration: string;
}

const initialInvoiceData: InvoiceFormData = {
  companyId: "",
  clientId: "",
  invoiceNumber: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  deliveryNote: "",
  modeOfPayment: "",
  supplierReference: "",
  destination: "",
  items: [],
  gstSlab: "",
  declaration:
    "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
};

const initialCompanyData: CompanyFormData = {
  companyName: "",
  proprietor: "",
  address: "",
  email: "",
  phoneNumber: "",
  state: "",
  city: "",
  gstNumber: "",
  invoiceNumberInitial: "",
  logo: null,
  logoPreview: "",
  signature: null,
  signaturePreview: "",
  accountNumber: "",
  bankName: "",
  ifscCode: "",
  branch: "",
};

const initialClientData: ClientFormData = {
  customerType: "business",
  salutation: "mr",
  firstName: "",
  lastName: "",
  panNumber: "",
  companyName: "",
  currency: "inr",
  gstApplicable: false,
  gstin: "",
  stateCode: "",
  billingCountry: "",
  billingState: "",
  billingCity: "",
  billingAddressLine1: "",
  billingAddressLine2: "",
  billingContactNo: "",
  billingEmail: "",
  billingAlternateContactNo: "",
  shippingCountry: "",
  shippingState: "",
  shippingCity: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingContactNo: "",
  shippingEmail: "",
  shippingAlternateContactNo: "",
};

const initialItemData: ItemFormData = {
  itemName: "",
  itemDescription: "",
  hsnCode: "",
  qtyAvailable: "",
  rate: "",
  unit: "",
};

export function InvoiceForm() {
  const [invoiceData, setInvoiceData] =
    React.useState<InvoiceFormData>(initialInvoiceData);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [items, setItems] = React.useState<Item[]>([]);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(
    null
  );
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null
  );

  const [companyDialogOpen, setCompanyDialogOpen] = React.useState(false);
  const [clientDialogOpen, setClientDialogOpen] = React.useState(false);
  const [itemDialogOpen, setItemDialogOpen] = React.useState(false);
  const [companyFormData, setCompanyFormData] =
    React.useState<CompanyFormData>(initialCompanyData);
  const [clientFormData, setClientFormData] =
    React.useState<ClientFormData>(initialClientData);
  const [itemFormData, setItemFormData] =
    React.useState<ItemFormData>(initialItemData);
  const [editingItemIndex, setEditingItemIndex] = React.useState<number | null>(
    null
  );
  const invoiceIdCounterRef = React.useRef(0);

  const loadData = React.useCallback(async () => {
    const [companiesData, clientsData, itemsData] = await Promise.all([
      dbService.companies.getAll(),
      dbService.clients.getAll(),
      dbService.items.getAll(),
    ]);
    setCompanies(companiesData as Company[]);
    setClients(clientsData as Client[]);
    setItems(itemsData as Item[]);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    const fetchLastInvoiceAndSetCompany = async () => {
      if (invoiceData.companyId) {
        const company = companies.find((c) => c.id === invoiceData.companyId);
        setSelectedCompany(company || null);
        if (company) {
          if (company.gstNumber) {
            setInvoiceData((prev) => ({ ...prev, gstSlab: "18" }));
          } else {
            setInvoiceData((prev) => ({ ...prev, gstSlab: "" }));
          }

          if (company.invoiceNumberInitial && invoiceData.invoiceDate) {
            const lastInvoiceResult =
              await dbService.invoices.getLastByCompanyId(company.id);
            let nextInvoiceCount = company.invoiceCount;

            if (lastInvoiceResult.success && lastInvoiceResult.data) {
              const lastInvoice = lastInvoiceResult.data as {
                invoiceNumber: string;
              };
              const invoiceNumberParts = lastInvoice.invoiceNumber.split("/");
              if (invoiceNumberParts.length === 3) {
                const lastCount = parseInt(invoiceNumberParts[1], 10);
                if (!isNaN(lastCount)) {
                  nextInvoiceCount = lastCount;
                }
              }
            }

            const invoiceDate = new Date(invoiceData.invoiceDate);
            const year = invoiceDate.getFullYear();
            const nextYear = String(year + 1).slice(-2);
            const currentYear = String(year).slice(-2);
            const nextInvoiceNumber = `${company.invoiceNumberInitial}/${String(
              nextInvoiceCount + 1
            ).padStart(2, "0")}/${currentYear}-${nextYear}`;
            setInvoiceData((prev) => ({
              ...prev,
              invoiceNumber: nextInvoiceNumber,
            }));
          }
        }
      } else {
        setSelectedCompany(null);
      }
    };

    fetchLastInvoiceAndSetCompany();
  }, [invoiceData.companyId, companies, invoiceData.invoiceDate]);

  React.useEffect(() => {
    if (
      selectedCompany &&
      selectedCompany.invoiceNumberInitial &&
      invoiceData.invoiceDate &&
      invoiceData.invoiceNumber
    ) {
      const invoiceDate = new Date(invoiceData.invoiceDate);
      const year = invoiceDate.getFullYear();
      const nextYear = String(year + 1).slice(-2);
      const currentYear = String(year).slice(-2);
      const invoiceNumberParts = invoiceData.invoiceNumber.split("/");

      if (invoiceNumberParts.length === 3) {
        const countPart = invoiceNumberParts[1];
        const newInvoiceNumber = `${selectedCompany.invoiceNumberInitial}/${countPart}/${currentYear}-${nextYear}`;
        if (newInvoiceNumber !== invoiceData.invoiceNumber) {
          setInvoiceData((prev) => ({
            ...prev,
            invoiceNumber: newInvoiceNumber,
          }));
        }
      }
    }
  }, [invoiceData.invoiceDate, selectedCompany, invoiceData.invoiceNumber]);

  React.useEffect(() => {
    if (invoiceData.clientId) {
      const client = clients.find((c) => c.id === invoiceData.clientId);
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [invoiceData.clientId, clients]);

  const handleFieldChange = <K extends keyof InvoiceFormData>(
    field: K,
    value: InvoiceFormData[K]
  ) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setInvoiceData((prev) => {
      const newItems = [...prev.items];
      const item = { ...newItems[index], [field]: value };

      if (field === "quantity" || field === "rate") {
        item.amount = (item.quantity || 0) * (item.rate || 0);
      }

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const handleItemSelect = React.useCallback(
    (index: number, itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      setInvoiceData((prev) => {
        const newItems = [...prev.items];
        const currentItem = newItems[index];

        if (!currentItem) return prev;

        if (currentItem.itemId === itemId && currentItem.itemId !== "") {
          currentItem.quantity = (currentItem.quantity || 0) + 1;
          currentItem.amount = currentItem.quantity * (currentItem.rate || 0);
          return { ...prev, items: newItems };
        }

        if (currentItem.itemId === itemId) {
          return prev;
        }

        const existingItemIndex = newItems.findIndex(
          (invItem) =>
            invItem.itemId === itemId && invItem.id !== newItems[index].id
        );

        if (existingItemIndex !== -1) {
          const existingItem = newItems[existingItemIndex];
          existingItem.quantity = (existingItem.quantity || 0) + 1;
          existingItem.amount =
            existingItem.quantity * (existingItem.rate || 0);

          newItems.splice(index, 1);
          newItems.forEach((invItem, i) => {
            invItem.serialNumber = i + 1;
          });

          return { ...prev, items: newItems };
        }

        newItems[index] = {
          ...newItems[index],
          itemId: item.id,
          description:
            item.itemName +
            (item.itemDescription ? ` - ${item.itemDescription}` : ""),
          hsnCode: item.hsnCode,
          rate: parseFloat(item.rate) || 0,
          unit: item.unit || "",
          per: item.unit || "",
          quantity: newItems[index].quantity || 1,
          amount:
            (newItems[index].quantity || 1) * (parseFloat(item.rate) || 0),
        };
        return { ...prev, items: newItems };
      });
    },
    [items]
  );

  const addItemRow = () => {
    setInvoiceData((prev) => {
      const newItem: InvoiceItem = {
        id: `item-${Date.now()}-${prev.items.length}`,
        serialNumber: prev.items.length + 1,
        itemId: "",
        description: "",
        hsnCode: "",
        quantity: 0,
        unit: "",
        rate: 0,
        per: "",
        amount: 0,
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  const addBulkRows = () => {
    setInvoiceData((prev) => {
      const newItems: InvoiceItem[] = [];
      const startIndex = prev.items.length;
      for (let i = 0; i < 5; i++) {
        newItems.push({
          id: `item-${Date.now()}-${startIndex + i}`,
          serialNumber: startIndex + i + 1,
          itemId: "",
          description: "",
          hsnCode: "",
          quantity: 0,
          unit: "",
          rate: 0,
          per: "",
          amount: 0,
        });
      }
      return { ...prev, items: [...prev.items, ...newItems] };
    });
  };

  const removeItemRow = (index: number) => {
    setInvoiceData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      newItems.forEach((item, i) => {
        item.serialNumber = i + 1;
      });
      return { ...prev, items: newItems };
    });
  };

  const calculateTotals = () => {
    const totalQuantity = invoiceData.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalAmountBeforeTax = invoiceData.items.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );

    const taxDetailsMap = new Map<string, TaxDetail>();

    invoiceData.items.forEach((item) => {
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

    if (invoiceData.gstSlab !== "") {
      const gstRate = parseFloat(invoiceData.gstSlab);
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

    const outputCGST = Array.from(taxDetailsMap.values()).reduce(
      (sum, detail) => sum + detail.centralTaxAmount,
      0
    );
    const outputSGST = Array.from(taxDetailsMap.values()).reduce(
      (sum, detail) => sum + detail.stateTaxAmount,
      0
    );
    const totalTaxAmount = outputCGST + outputSGST;
    const totalInvoiceAmount = totalAmountBeforeTax + totalTaxAmount;

    return {
      totalQuantity,
      totalAmountBeforeTax,
      outputCGST,
      outputSGST,
      totalTaxAmount,
      totalInvoiceAmount,
      taxDetails: Array.from(taxDetailsMap.values()),
    };
  };

  const totals = calculateTotals();

  const handleCompanySubmit = async (data: CompanyFormData) => {
    const newCompany: Company = {
      ...data,
      id: `company-${Date.now()}`,
      revenueTotal: 0,
      debt: 0,
      invoiceCount: 0,
    };

    const result = await dbService.companies.create(newCompany);
    if (result.success) {
      await loadData();
      setInvoiceData((prev) => ({ ...prev, companyId: newCompany.id }));
      setCompanyDialogOpen(false);
      setCompanyFormData(initialCompanyData);
    }
  };

  const handleClientSubmit = async (data: ClientFormData) => {
    const newClient: Client = {
      ...data,
      id: `client-${Date.now()}`,
      balance: 0,
    };

    const result = await dbService.clients.create(newClient);
    if (result.success) {
      await loadData();
      setInvoiceData((prev) => ({ ...prev, clientId: newClient.id }));
      setClientDialogOpen(false);
      setClientFormData(initialClientData);
    }
  };

  const handleItemSubmit = async (data: ItemFormData) => {
    const newItem: Item = {
      ...data,
      id: `item-${Date.now()}`,
    };

    const result = await dbService.items.create(newItem);
    if (result.success) {
      await loadData();
      if (editingItemIndex !== null) {
        handleItemSelect(editingItemIndex, newItem.id);
      }
      setItemDialogOpen(false);
      setItemFormData(initialItemData);
      setEditingItemIndex(null);
    }
  };

  const generateInvoiceId = () => {
    invoiceIdCounterRef.current += 1;
    return `invoice-${invoiceIdCounterRef.current}-${String(
      invoiceIdCounterRef.current
    ).padStart(6, "0")}`;
  };

  const handleSave = async () => {
    if (
      !invoiceData.companyId ||
      !invoiceData.clientId ||
      invoiceData.items.length === 0
    ) {
      alert("Please fill in all required fields and add at least one item.");
      return;
    }

    if (!selectedCompany) {
      alert("Please select a company.");
      return;
    }

    const invoiceId = generateInvoiceId();
    const invoicePayload = {
      id: invoiceId,
      companyId: invoiceData.companyId,
      clientId: invoiceData.clientId,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      items: JSON.stringify(invoiceData.items),
      subtotal: totals.totalAmountBeforeTax,
      taxAmount: totals.totalTaxAmount,
      totalAmount: totals.totalInvoiceAmount,
      status: "draft" as const,
      notes: JSON.stringify({
        deliveryNote: invoiceData.deliveryNote,
        modeOfPayment: invoiceData.modeOfPayment,
        supplierReference: invoiceData.supplierReference,
        buyerOrderNumber: invoiceData.invoiceNumber,
        destination: invoiceData.destination,
        gstSlab: invoiceData.gstSlab,
        declaration: invoiceData.declaration,
      }),
    };

    const result = await dbService.invoices.create(invoicePayload);
    if (result.success) {
      const invoiceNumberParts = invoiceData.invoiceNumber.split("/");
      let newInvoiceCount = selectedCompany.invoiceCount;
      if (invoiceNumberParts.length === 3) {
        const count = parseInt(invoiceNumberParts[1], 10);
        if (!isNaN(count)) {
          newInvoiceCount = count;
        } else {
          newInvoiceCount = selectedCompany.invoiceCount + 1;
        }
      } else {
        newInvoiceCount = selectedCompany.invoiceCount + 1;
      }

      const updatedCompany = {
        ...selectedCompany,
        invoiceCount: newInvoiceCount,
      };
      await dbService.companies.update(selectedCompany.id, updatedCompany);
      alert("Invoice saved successfully!");
      setInvoiceData(initialInvoiceData);
      await loadData();
    } else {
      alert("Failed to save invoice. Please try again.");
    }
  };

  const handleDownloadPDF = () => {
    console.log("Download PDF clicked");
    alert("PDF download functionality will be implemented");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>
                  Company <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={invoiceData.companyId}
                    onValueChange={(value) =>
                      handleFieldChange("companyId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCompanyFormData(initialCompanyData);
                      setCompanyDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="size-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {selectedCompany && (
                <div className="text-sm space-y-1 p-3 bg-muted rounded">
                  <div>
                    <strong>{selectedCompany.companyName}</strong>
                  </div>
                  <div>{selectedCompany.address}</div>
                  <div>
                    {selectedCompany.city}, {selectedCompany.state}
                  </div>
                  {selectedCompany.gstNumber && (
                    <div>GSTIN/UIN: {selectedCompany.gstNumber}</div>
                  )}
                  <div>Email: {selectedCompany.email}</div>
                </div>
              )}

              <div className="grid gap-2">
                <Label>
                  Client <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={invoiceData.clientId}
                    onValueChange={(value) =>
                      handleFieldChange("clientId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.customerType === "business"
                            ? client.companyName ||
                              `${client.firstName} ${client.lastName}`
                            : `${client.firstName} ${client.lastName}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setClientFormData(initialClientData);
                      setClientDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="size-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {selectedClient && (
                <div className="text-sm space-y-1 p-3 bg-muted rounded">
                  <div>
                    <strong>
                      {selectedClient.customerType === "business"
                        ? selectedClient.companyName ||
                          `${selectedClient.firstName} ${selectedClient.lastName}`
                        : `${selectedClient.firstName} ${selectedClient.lastName}`}
                    </strong>
                  </div>
                  <div>{selectedClient.billingAddressLine1}</div>
                  {selectedClient.billingAddressLine2 && (
                    <div>{selectedClient.billingAddressLine2}</div>
                  )}
                  <div>
                    {selectedClient.billingCity}, {selectedClient.billingState}
                  </div>
                  {selectedClient.gstin && (
                    <div>GSTIN/UIN: {selectedClient.gstin}</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Invoice Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={invoiceData.invoiceNumber}
                    onChange={(e) =>
                      handleFieldChange("invoiceNumber", e.target.value)
                    }
                    placeholder="Invoice Number (Auto-generated)"
                    required
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    Invoice Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) =>
                      handleFieldChange("invoiceDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Delivery Note</Label>
                  <Input
                    value={invoiceData.deliveryNote}
                    onChange={(e) =>
                      handleFieldChange("deliveryNote", e.target.value)
                    }
                    placeholder="Delivery Note"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Mode/Terms of Payment</Label>
                  <Input
                    value={invoiceData.modeOfPayment}
                    onChange={(e) =>
                      handleFieldChange("modeOfPayment", e.target.value)
                    }
                    placeholder="Payment Terms"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Supplier&apos;s Reference</Label>
                  <Input
                    value={invoiceData.supplierReference}
                    onChange={(e) =>
                      handleFieldChange("supplierReference", e.target.value)
                    }
                    placeholder="Supplier's Ref"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Destination</Label>
                  <Input
                    value={invoiceData.destination}
                    onChange={(e) =>
                      handleFieldChange("destination", e.target.value)
                    }
                    placeholder="Destination"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Item Details</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={addItemRow}>
                  <PlusIcon className="size-4 mr-2" />
                  Add Row
                </Button>
                <Button type="button" variant="outline" onClick={addBulkRows}>
                  <PlusIcon className="size-4 mr-2" />
                  Add 5 Rows
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">S. No.</th>
                    <th className="border p-2 text-left">
                      Description of Goods
                    </th>
                    <th className="border p-2 text-left">HSN/SAC</th>
                    <th className="border p-2 text-left">Quantity</th>
                    <th className="border p-2 text-left">Unit</th>
                    <th className="border p-2 text-left">Rate</th>
                    <th className="border p-2 text-left">Per</th>
                    <th className="border p-2 text-left">Amount</th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border p-2">
                        <Input
                          type="number"
                          value={item.serialNumber}
                          readOnly
                          className="w-16"
                        />
                      </td>
                      <td className="border p-2">
                        <div className="flex gap-2">
                          <Select
                            value={item.itemId}
                            onValueChange={(value) =>
                              handleItemSelect(index, value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Item" />
                            </SelectTrigger>
                            <SelectContent>
                              {items.map((it) => (
                                <SelectItem key={it.id} value={it.id}>
                                  {it.itemName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditingItemIndex(index);
                              setItemFormData(initialItemData);
                              setItemDialogOpen(true);
                            }}
                          >
                            <PlusIcon className="size-4" />
                          </Button>
                        </div>
                        <Input
                          className="mt-2"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Description"
                        />
                        <Input
                          className="mt-2"
                          value={item.batch || ""}
                          onChange={(e) =>
                            handleItemChange(index, "batch", e.target.value)
                          }
                          placeholder="Batch (optional)"
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          value={item.hsnCode}
                          onChange={(e) =>
                            handleItemChange(index, "hsnCode", e.target.value)
                          }
                          placeholder="HSN/SAC"
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          value={item.unit}
                          onChange={(e) =>
                            handleItemChange(index, "unit", e.target.value)
                          }
                          placeholder="Unit"
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          value={item.rate || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "rate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          value={item.per}
                          onChange={(e) =>
                            handleItemChange(index, "per", e.target.value)
                          }
                          placeholder="Per"
                        />
                      </td>
                      <td className="border p-2">
                        <Input
                          type="number"
                          value={item.amount.toFixed(2)}
                          readOnly
                          className="bg-muted"
                        />
                      </td>
                      <td className="border p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeItemRow(index)}
                        >
                          <TrashIcon className="size-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {invoiceData.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="border p-4 text-center text-muted-foreground"
                      >
                        No items added. Click &quot;Add Row&quot; to add items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {invoiceData.items.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Quantity:</span>
                    <span className="font-semibold">
                      {totals.totalQuantity.toLocaleString()}{" "}
                      {invoiceData.items[0]?.unit || ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Goods Amount:</span>
                    <span className="font-semibold">
                      ₹
                      {totals.totalAmountBeforeTax.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedCompany?.gstNumber && invoiceData.gstSlab !== "" && (
                    <>
                      <div className="flex justify-between">
                        <span>Output CGST:</span>
                        <span className="font-semibold">
                          ₹
                          {totals.outputCGST.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Output SGST:</span>
                        <span className="font-semibold">
                          ₹
                          {totals.outputSGST.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>
                      ₹
                      {totals.totalInvoiceAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedCompany?.gstNumber && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>GST Slab</Label>
                  <Select
                    value={invoiceData.gstSlab}
                    onValueChange={(value) =>
                      handleFieldChange("gstSlab", value as "18" | "5" | "")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select GST Slab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18">
                        18% (9% CGST + 9% SGST)
                      </SelectItem>
                      <SelectItem value="5">
                        5% (2.5% CGST + 2.5% SGST)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {invoiceData.gstSlab !== "" && totals.taxDetails.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border p-2 text-left">HSN/SAC</th>
                          <th className="border p-2 text-left">
                            Taxable Value
                          </th>
                          <th className="border p-2 text-left">
                            Central Tax Rate
                          </th>
                          <th className="border p-2 text-left">
                            Central Tax Amount
                          </th>
                          <th className="border p-2 text-left">
                            State Tax Rate
                          </th>
                          <th className="border p-2 text-left">
                            State Tax Amount
                          </th>
                          <th className="border p-2 text-left">
                            Total Tax Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {totals.taxDetails.map((detail, index) => (
                          <tr key={index}>
                            <td className="border p-2">{detail.hsnCode}</td>
                            <td className="border p-2">
                              ₹
                              {detail.taxableValue.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="border p-2">
                              {detail.centralTaxRate}%
                            </td>
                            <td className="border p-2">
                              ₹
                              {detail.centralTaxAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="border p-2">
                              {detail.stateTaxRate}%
                            </td>
                            <td className="border p-2">
                              ₹
                              {detail.stateTaxAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="border p-2">
                              ₹
                              {detail.totalTaxAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-semibold">
                          <td className="border p-2">Total</td>
                          <td className="border p-2">
                            ₹
                            {totals.totalAmountBeforeTax.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </td>
                          <td className="border p-2">-</td>
                          <td className="border p-2">
                            ₹
                            {totals.outputCGST.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="border p-2">-</td>
                          <td className="border p-2">
                            ₹
                            {totals.outputSGST.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="border p-2">
                            ₹
                            {totals.totalTaxAmount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Amount Chargeable (in words)</Label>
              <div className="p-3 bg-muted rounded font-semibold">
                INR {numberToWords(totals.totalInvoiceAmount)}
              </div>
            </div>

            {selectedCompany?.gstNumber && totals.totalTaxAmount > 0 && (
              <div className="grid gap-2">
                <Label>Tax Amount (in words)</Label>
                <div className="p-3 bg-muted rounded font-semibold">
                  INR {numberToWords(totals.totalTaxAmount)}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Declaration</Label>
              <Textarea
                value={invoiceData.declaration}
                onChange={(e) =>
                  handleFieldChange("declaration", e.target.value)
                }
                rows={3}
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleDownloadPDF}>
              <DownloadIcon className="size-4 mr-2" />
              Download PDF
            </Button>
            <Button type="button" onClick={handleSave}>
              <SaveIcon className="size-4 mr-2" />
              Save Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      <CompaniesDialog
        open={companyDialogOpen}
        onOpenChange={setCompanyDialogOpen}
        companyData={companyFormData}
        onCompanyDataChange={setCompanyFormData}
        onSubmit={handleCompanySubmit}
        title="Add New Company"
      />

      <ClientsDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        clientData={clientFormData}
        onClientDataChange={setClientFormData}
        onSubmit={handleClientSubmit}
        title="Add New Client"
      />

      <ItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        itemData={itemFormData}
        onItemDataChange={setItemFormData}
        onSubmit={handleItemSubmit}
        title="Add New Item"
      />
    </div>
  );
}
