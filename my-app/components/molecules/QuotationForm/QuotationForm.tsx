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
import {
  PlusIcon,
  TrashIcon,
  DownloadIcon,
  SaveIcon,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Company, Client, Quotation } from "@/lib/types";
import {
  fetchCompanies,
  createCompanyThunk,
} from "@/store/thunks/companiesThunks";
import { fetchClients, createClientThunk } from "@/store/thunks/clientsThunks";
import { fetchItems, createItemThunk } from "@/store/thunks/itemsThunks";
import {
  fetchQuotations,
  createQuotationThunk,
  updateQuotationThunk,
  getQuotationByIdThunk,
  getQuotationByQuotationIdThunk,
} from "@/store/thunks/quotationsThunks";
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
import { renderToStaticMarkup } from "react-dom/server";
import QuotationPDF from "@/components/pdf/QuotationPDF";

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

interface QuotationFormData {
  companyId: string;
  clientId: string;
  toPartyName: string;
  toPartyAddress: string;
  quotationId: string;
  subject: string;
  quotationDate: string;
  items: QuotationItem[];
  termsAndConditions: string;
}

const initialQuotationData: QuotationFormData = {
  companyId: "",
  clientId: "",
  toPartyName: "",
  toPartyAddress: "",
  quotationId: "",
  subject: "",
  quotationDate: new Date().toISOString().split("T")[0],
  items: [],
  termsAndConditions: "GST Charges As Applicable",
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

interface QuotationFormProps {
  onRefreshRef?: React.MutableRefObject<(() => Promise<void>) | undefined>;
  editQuotationId?: string;
}

export function QuotationForm({ onRefreshRef, editQuotationId }: QuotationFormProps) {
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);
  const clients = useAppSelector((state) => state.clients.clients);
  const items = useAppSelector((state) => state.items.items);
  const [quotationData, setQuotationData] =
    React.useState<QuotationFormData>(initialQuotationData);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(
    null
  );
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null
  );
  const [useClient, setUseClient] = React.useState(true);

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
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingQuotationId, setEditingQuotationId] = React.useState<string | null>(
    null
  );

  const loadData = React.useCallback(async () => {
    await Promise.all([
      dispatch(fetchCompanies()),
      dispatch(fetchClients()),
      dispatch(fetchItems()),
    ]);
  }, [dispatch]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    const loadQuotationForEdit = async () => {
      if (editQuotationId) {
        try {
          const result = await dispatch(
            getQuotationByIdThunk({ id: editQuotationId })
          );
          if (getQuotationByIdThunk.fulfilled.match(result) && result.payload) {
            const quotation = result.payload;
            const items = quotation.items ? JSON.parse(quotation.items) : [];

            setQuotationData({
              companyId: quotation.companyId,
              clientId: quotation.clientId || "",
              toPartyName: quotation.toPartyName || "",
              toPartyAddress: quotation.toPartyAddress || "",
              quotationId: quotation.quotationId,
              subject: quotation.subject,
              quotationDate: quotation.quotationDate,
              items: items.map((item: QuotationItem, index: number) => ({
                ...item,
                serialNumber: index + 1,
              })),
              termsAndConditions: quotation.termsAndConditions || initialQuotationData.termsAndConditions,
            });
            setIsEditing(true);
            setEditingQuotationId(quotation.id);
            setUseClient(!!quotation.clientId);
          }
        } catch (error) {
          console.error("Error loading quotation for edit:", error);
        }
      } else {
        setIsEditing(false);
        setEditingQuotationId(null);
      }
    };

    loadQuotationForEdit();
  }, [editQuotationId, dispatch]);

  React.useEffect(() => {
    if (onRefreshRef) {
      onRefreshRef.current = loadData;
    }
  }, [loadData, onRefreshRef]);

  React.useEffect(() => {
    if (quotationData.companyId) {
      const company = companies.find((c) => c.id === quotationData.companyId);
      setSelectedCompany(company || null);
    } else {
      setSelectedCompany(null);
    }
  }, [quotationData.companyId, companies]);

  React.useEffect(() => {
    if (quotationData.clientId && useClient) {
      const client = clients.find((c) => c.id === quotationData.clientId);
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [quotationData.clientId, clients, useClient]);

  const handleFieldChange = <K extends keyof QuotationFormData>(
    field: K,
    value: QuotationFormData[K]
  ) => {
    setQuotationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof QuotationItem,
    value: string | number | null
  ) => {
    setQuotationData((prev) => {
      const newItems = [...prev.items];
      const item = { ...newItems[index], [field]: value };

      if (field === "quantity" || field === "rate") {
        const qty = typeof item.quantity === "number" ? item.quantity : 0;
        const rate = typeof item.rate === "number" ? item.rate : 0;
        item.amount = qty * rate > 0 ? qty * rate : null;
      }

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const handleItemSelect = React.useCallback(
    (index: number, itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      setQuotationData((prev) => {
        const newItems = [...prev.items];
        const currentItem = newItems[index];

        if (!currentItem) return prev;

        if (currentItem.itemId === itemId && currentItem.itemId !== "") {
          currentItem.quantity = (currentItem.quantity || 0) + 1;
          const qty = currentItem.quantity || 0;
          const rate = currentItem.rate || 0;
          currentItem.amount = qty * rate > 0 ? qty * rate : null;
          return { ...prev, items: newItems };
        }

        if (currentItem.itemId === itemId) {
          return prev;
        }

        const existingItemIndex = newItems.findIndex(
          (quotationItem) =>
            quotationItem.itemId === itemId && quotationItem.id !== newItems[index].id
        );

        if (existingItemIndex !== -1) {
          const existingItem = newItems[existingItemIndex];
          existingItem.quantity = (existingItem.quantity || 0) + 1;
          const qty = existingItem.quantity || 0;
          const rate = existingItem.rate || 0;
          existingItem.amount = qty * rate > 0 ? qty * rate : null;

          newItems.splice(index, 1);
          newItems.forEach((quotationItem, i) => {
            quotationItem.serialNumber = i + 1;
          });

          return { ...prev, items: newItems };
        }

        const qty = newItems[index].quantity || 1;
        const rate = parseFloat(item.rate) || 0;
        newItems[index] = {
          ...newItems[index],
          itemId: item.id,
          description:
            item.itemName +
            (item.itemDescription ? ` - ${item.itemDescription}` : ""),
          hsnCode: item.hsnCode,
          rate: rate,
          quantity: qty,
          amount: qty * rate > 0 ? qty * rate : null,
        };
        return { ...prev, items: newItems };
      });
    },
    [items]
  );

  const addItemRow = () => {
    setQuotationData((prev) => {
      const newItem: QuotationItem = {
        id: `item-${Date.now()}-${prev.items.length}`,
        serialNumber: prev.items.length + 1,
        itemId: "",
        description: "",
        hsnCode: "",
        quantity: 0,
        rate: 0,
        amount: null,
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  const removeItemRow = (index: number) => {
    setQuotationData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      newItems.forEach((item, i) => {
        item.serialNumber = i + 1;
      });
      return { ...prev, items: newItems };
    });
  };

  const calculateTotals = () => {
    const totalAmount = quotationData.items.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );

    return {
      totalAmount,
    };
  };

  const totals = calculateTotals();

  const handleCompanySubmit = async (data: CompanyFormData) => {
    const result = await dispatch(createCompanyThunk({ company: data }));
    if (createCompanyThunk.fulfilled.match(result)) {
      const newCompany = result.payload;
      await loadData();
      setQuotationData((prev) => ({ ...prev, companyId: newCompany.id }));
      setCompanyDialogOpen(false);
      setCompanyFormData(initialCompanyData);
    }
  };

  const handleClientSubmit = async (data: ClientFormData) => {
    const result = await dispatch(createClientThunk({ client: data }));
    if (createClientThunk.fulfilled.match(result)) {
      const newClient = result.payload;
      await loadData();
      setQuotationData((prev) => ({ ...prev, clientId: newClient.id }));
      setClientDialogOpen(false);
      setClientFormData(initialClientData);
    }
  };

  const handleItemSubmit = async (data: ItemFormData) => {
    const result = await dispatch(createItemThunk({ item: data }));
    if (createItemThunk.fulfilled.match(result)) {
      const newItem = result.payload;
      await loadData();
      if (editingItemIndex !== null) {
        handleItemSelect(editingItemIndex, newItem.id);
      }
      setItemDialogOpen(false);
      setItemFormData(initialItemData);
      setEditingItemIndex(null);
    }
  };

  const generateQuotationId = React.useCallback(() => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `quotation-${timestamp}-${random}`;
  }, []);

  const generateUniqueQuotationId = React.useCallback(
    async (quotationId: string): Promise<string> => {
      if (!quotationId) {
        return `QUOT-${Date.now()}`;
      }

      let attemptCount = 0;
      let finalQuotationId = quotationId;
      const quotationsResult = await dispatch(fetchQuotations());
      const existingQuotationIds = new Set<string>();

      if (fetchQuotations.fulfilled.match(quotationsResult)) {
        quotationsResult.payload.forEach((quot) => {
          existingQuotationIds.add(quot.quotationId);
        });
      }

      while (existingQuotationIds.has(finalQuotationId) && attemptCount < 1000) {
        finalQuotationId = `${quotationId}-${attemptCount + 1}`;
        attemptCount += 1;
      }

      return finalQuotationId;
    },
    [dispatch]
  );

  const handleSave = async (skipReset = false): Promise<Quotation | null> => {
    if (isEditing && editingQuotationId) {
      return handleUpdate(skipReset);
    }

    if (
      !quotationData.companyId ||
      !quotationData.quotationId ||
      !quotationData.subject ||
      quotationData.items.length === 0
    ) {
      alert("Please fill in all required fields and add at least one item.");
      return null;
    }

    if (!selectedCompany) {
      alert("Please select a company.");
      return null;
    }

    if (useClient && !quotationData.clientId) {
      alert("Please select a client or enter party details manually.");
      return null;
    }

    if (!useClient && (!quotationData.toPartyName || !quotationData.toPartyAddress)) {
      alert("Please enter party name and address.");
      return null;
    }

    const uniqueQuotationId = await generateUniqueQuotationId(quotationData.quotationId);
    const quotationId = generateQuotationId();

    const quotationPayload = {
      id: quotationId,
      companyId: quotationData.companyId,
      clientId: useClient ? quotationData.clientId : null,
      toPartyName: useClient ? null : quotationData.toPartyName,
      toPartyAddress: useClient ? null : quotationData.toPartyAddress,
      quotationId: uniqueQuotationId,
      subject: quotationData.subject,
      quotationDate: quotationData.quotationDate,
      items: JSON.stringify(quotationData.items),
      subtotal: totals.totalAmount,
      totalAmount: totals.totalAmount,
      termsAndConditions: quotationData.termsAndConditions,
    };

    let result = await dispatch(
      createQuotationThunk({
        quotation: quotationPayload,
      })
    );

    let finalQuotationId = uniqueQuotationId;
    let retryCount = 0;
    const maxRetries = 5;

    while (
      !createQuotationThunk.fulfilled.match(result) &&
      retryCount < maxRetries
    ) {
      const errorMessage = createQuotationThunk.rejected.match(result)
        ? (result.error as string) || ""
        : "";
      if (
        errorMessage.includes("UNIQUE constraint") ||
        errorMessage.includes("quotation_id")
      ) {
        retryCount += 1;
        finalQuotationId = await generateUniqueQuotationId(quotationData.quotationId);
        quotationPayload.quotationId = finalQuotationId;
        result = await dispatch(
          createQuotationThunk({
            quotation: quotationPayload,
          })
        );
      } else {
        break;
      }
    }

    if (createQuotationThunk.fulfilled.match(result)) {
      if (!skipReset) {
        alert("Quotation saved successfully!");
        setQuotationData(initialQuotationData);
        await loadData();
      }

      return result.payload;
    } else {
      alert("Failed to save quotation. Please try again.");
      return null;
    }
  };

  const handleUpdate = async (skipReset = false): Promise<Quotation | null> => {
    if (!editingQuotationId) {
      return null;
    }

    if (
      !quotationData.companyId ||
      !quotationData.quotationId ||
      !quotationData.subject ||
      quotationData.items.length === 0
    ) {
      alert("Please fill in all required fields and add at least one item.");
      return null;
    }

    if (!selectedCompany) {
      alert("Please select a company.");
      return null;
    }

    if (useClient && !quotationData.clientId) {
      alert("Please select a client or enter party details manually.");
      return null;
    }

    if (!useClient && (!quotationData.toPartyName || !quotationData.toPartyAddress)) {
      alert("Please enter party name and address.");
      return null;
    }

    try {
      const result = await dispatch(
        updateQuotationThunk({
          id: editingQuotationId,
          quotation: {
            companyId: quotationData.companyId,
            clientId: useClient ? quotationData.clientId : null,
            toPartyName: useClient ? null : quotationData.toPartyName,
            toPartyAddress: useClient ? null : quotationData.toPartyAddress,
            quotationId: quotationData.quotationId,
            subject: quotationData.subject,
            quotationDate: quotationData.quotationDate,
            items: JSON.stringify(quotationData.items),
            subtotal: totals.totalAmount,
            totalAmount: totals.totalAmount,
            termsAndConditions: quotationData.termsAndConditions,
          },
        })
      );

      if (updateQuotationThunk.fulfilled.match(result)) {
        const updatedQuotation = await dispatch(
          getQuotationByIdThunk({ id: editingQuotationId })
        );

        if (!skipReset) {
          alert("Quotation updated successfully!");
          setQuotationData(initialQuotationData);
          setIsEditing(false);
          setEditingQuotationId(null);
          await loadData();
        }

        return getQuotationByIdThunk.fulfilled.match(updatedQuotation) &&
          updatedQuotation.payload
          ? (updatedQuotation.payload as Quotation)
          : null;
      } else {
        const errorMessage = updateQuotationThunk.rejected.match(result)
          ? (result.error as string) || "Unknown error"
          : "Failed to update quotation";
        alert(`Failed to update quotation: ${errorMessage}`);
        return null;
      }
    } catch (error) {
      console.error("Error updating quotation:", error);
      alert("Failed to update quotation. Please try again.");
      return null;
    }
  };

  const generatePDF = async (
    quotation: Quotation,
    company: Company,
    client: Client | null,
    toPartyName: string | null,
    toPartyAddress: string | null
  ): Promise<Blob> => {
    const html = renderToStaticMarkup(
      <QuotationPDF
        quotation={quotation}
        company={company}
        client={client}
        toPartyName={toPartyName}
        toPartyAddress={toPartyAddress}
      />
    );

    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    return await response.blob();
  };

  const downloadPDF = async (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAndSave = async () => {
    if (!selectedCompany) {
      alert("Please select company first.");
      return;
    }

    const savedQuotation = await handleSave(true);
    if (!savedQuotation) {
      return;
    }

    try {
      const client = useClient && quotationData.clientId
        ? clients.find((c) => c.id === quotationData.clientId) || null
        : null;
      const blob = await generatePDF(
        savedQuotation,
        selectedCompany,
        client,
        useClient ? null : quotationData.toPartyName,
        useClient ? null : quotationData.toPartyAddress
      );
      await downloadPDF(blob, `quotation_${savedQuotation.quotationId}.pdf`);
      alert(
        isEditing
          ? "Quotation updated and downloaded successfully!"
          : "Quotation saved and downloaded successfully!"
      );
      setQuotationData(initialQuotationData);
      setIsEditing(false);
      setEditingQuotationId(null);
      await loadData();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert(
        isEditing
          ? "Quotation updated but failed to generate PDF. Please try again."
          : "Quotation saved but failed to generate PDF. Please try again."
      );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quotation</CardTitle>
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
                    value={quotationData.companyId}
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
                <Label>To Party</Label>
                <div className="flex gap-2 items-center">
                  <Select
                    value={useClient ? "client" : "manual"}
                    onValueChange={(value) => {
                      setUseClient(value === "client");
                      if (value === "manual") {
                        handleFieldChange("clientId", "");
                      } else {
                        handleFieldChange("toPartyName", "");
                        handleFieldChange("toPartyAddress", "");
                      }
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                  {useClient && (
                    <>
                      <Select
                        value={quotationData.clientId}
                        onValueChange={(value) =>
                          handleFieldChange("clientId", value)
                        }
                      >
                        <SelectTrigger className="flex-1">
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
                    </>
                  )}
                </div>
              </div>

              {useClient && selectedClient && (
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

              {!useClient && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>
                      Party Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={quotationData.toPartyName}
                      onChange={(e) =>
                        handleFieldChange("toPartyName", e.target.value)
                      }
                      placeholder="Enter Party Name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      Party Address <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      value={quotationData.toPartyAddress}
                      onChange={(e) =>
                        handleFieldChange("toPartyAddress", e.target.value)
                      }
                      placeholder="Enter Party Address"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label>
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={quotationData.subject}
                  onChange={(e) =>
                    handleFieldChange("subject", e.target.value)
                  }
                  placeholder="e.g., Estimate for Electric Work"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Quotation ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={quotationData.quotationId}
                    onChange={(e) =>
                      handleFieldChange("quotationId", e.target.value)
                    }
                    placeholder="Quotation ID"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={quotationData.quotationDate}
                    onChange={(e) =>
                      handleFieldChange("quotationDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-semibold">Items</Label>
              <Button type="button" variant="outline" onClick={addItemRow}>
                <PlusIcon className="size-4 mr-2" />
                Add Row
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Sr.No</th>
                    <th className="border p-2 text-left">Particular</th>
                    <th className="border p-2 text-left">HSN</th>
                    <th className="border p-2 text-left">Qty</th>
                    <th className="border p-2 text-left">Rate</th>
                    <th className="border p-2 text-left">Amount</th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationData.items.map((item, index) => (
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
                      </td>
                      <td className="border p-2">
                        <Input
                          value={item.hsnCode}
                          onChange={(e) =>
                            handleItemChange(index, "hsnCode", e.target.value)
                          }
                          placeholder="HSN"
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
                          type="number"
                          value={item.amount !== null ? item.amount.toFixed(2) : ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              handleItemChange(index, "amount", null);
                            } else {
                              handleItemChange(
                                index,
                                "amount",
                                parseFloat(value) || 0
                              );
                            }
                          }}
                          placeholder="Optional"
                          min="0"
                          step="0.01"
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
                  {quotationData.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border p-4 text-center text-muted-foreground"
                      >
                        No items added. Click &quot;Add Row&quot; to add items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {quotationData.items.length > 0 && (
              <div className="flex justify-end mt-4">
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex justify-between w-64">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">
                      ₹
                      {totals.totalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Amount in Words: {numberToWords(totals.totalAmount)} Only/-
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Terms and Conditions</Label>
                <Textarea
                  value={quotationData.termsAndConditions}
                  onChange={(e) =>
                    handleFieldChange("termsAndConditions", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadAndSave}
            >
              <DownloadIcon className="size-4 mr-2" />
              Download PDF
            </Button>
            <Button type="button" onClick={() => handleSave()}>
              <SaveIcon className="size-4 mr-2" />
              {isEditing ? "Update Quotation" : "Save Quotation"}
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

