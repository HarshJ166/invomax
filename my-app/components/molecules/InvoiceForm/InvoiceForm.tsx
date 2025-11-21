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
  UploadIcon,
  XIcon,
  EyeIcon,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Company, Client, Invoice } from "@/lib/types";
import {
  fetchCompanies,
  createCompanyThunk,
  updateCompanyThunk,
} from "@/store/thunks/companiesThunks";
import { fetchClients, createClientThunk } from "@/store/thunks/clientsThunks";
import { fetchItems, createItemThunk } from "@/store/thunks/itemsThunks";
import {
  fetchInvoices,
  createInvoiceThunk,
  updateInvoiceThunk,
  getLastInvoiceByCompanyIdThunk,
  getInvoiceByIdThunk,
} from "@/store/thunks/invoicesThunks";
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
import InvoicePDF from "@/components/pdf/InvoicePDF";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  image: string | null;
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
  image: null,
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

interface InvoiceFormProps {
  onRefreshRef?: React.MutableRefObject<(() => Promise<void>) | undefined>;
  editInvoiceId?: string;
}

export function InvoiceForm({ onRefreshRef, editInvoiceId }: InvoiceFormProps) {
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);
  const clients = useAppSelector((state) => state.clients.clients);
  const items = useAppSelector((state) => state.items.items);
  const [invoiceData, setInvoiceData] =
    React.useState<InvoiceFormData>(initialInvoiceData);
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
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = React.useState<string | null>(
    null
  );
  const [outOfStockItems, setOutOfStockItems] = React.useState<
    Set<string>
  >(new Set());
  const [consentGivenItems, setConsentGivenItems] = React.useState<
    Set<string>
  >(new Set());
  const [pendingConsentItem, setPendingConsentItem] = React.useState<{
    itemId: string;
    itemName: string;
    requestedQty: number;
    availableQty: number;
    index: number;
  } | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewPdfBlob, setPreviewPdfBlob] = React.useState<Blob | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = React.useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = React.useState("");
  const [previewFilename, setPreviewFilename] = React.useState("");
  const [pendingSave, setPendingSave] = React.useState(false);

  React.useEffect(() => {
    if (previewPdfBlob) {
      const url = URL.createObjectURL(previewPdfBlob);
      setPreviewPdfUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewPdfUrl(null);
    }
  }, [previewPdfBlob]);

  const loadData = React.useCallback(async () => {
    await Promise.all([
      dispatch(fetchCompanies()),
      dispatch(fetchClients()),
      dispatch(fetchItems()),
    ]);
  }, [dispatch]);

  const checkQuantityAvailability = (
    itemId: string,
    quantity: number
  ): { available: number; exceeds: boolean } | null => {
    if (!itemId) return null;
    const item = items.find((i) => i.id === itemId);
    if (!item) return null;

    const availableQty = parseFloat(item.qtyAvailable) || 0;
    return {
      available: availableQty,
      exceeds: quantity > availableQty,
    };
  };

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  React.useEffect(() => {
    const loadInvoiceForEdit = async () => {
      if (editInvoiceId) {
        console.log(
          "[InvoiceForm] Loading invoice for edit, ID:",
          editInvoiceId
        );
        try {
          const result = await dispatch(
            getInvoiceByIdThunk({ id: editInvoiceId })
          );
          if (getInvoiceByIdThunk.fulfilled.match(result) && result.payload) {
            const invoice = result.payload;
            const notes = invoice.notes ? JSON.parse(invoice.notes) : {};
            const items = invoice.items ? JSON.parse(invoice.items) : [];

            console.log("[InvoiceForm] Invoice loaded for edit:", {
              id: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
            });

            const loadedItems = items.map((item: InvoiceItem, index: number) => ({
              ...item,
              serialNumber: index + 1,
            }));

            const outOfStockSet = new Set<string>();
            loadedItems.forEach((item) => {
              if (item.itemId) {
                const availability = checkQuantityAvailability(
                  item.itemId,
                  item.quantity || 0
                );
                if (availability && availability.exceeds) {
                  outOfStockSet.add(item.itemId);
                }
              }
            });

            setOutOfStockItems(outOfStockSet);

            setInvoiceData({
              companyId: invoice.companyId,
              clientId: invoice.clientId,
              invoiceNumber: invoice.invoiceNumber,
              invoiceDate: invoice.invoiceDate,
              deliveryNote: notes.deliveryNote || "",
              modeOfPayment: notes.modeOfPayment || "",
              supplierReference: notes.supplierReference || "",
              destination: notes.destination || "",
              items: loadedItems,
              gstSlab: (notes.gstSlab as "18" | "5" | "") || "",
              declaration: notes.declaration || initialInvoiceData.declaration,
              image: invoice.image || null,
            });
            setIsEditing(true);
            setEditingInvoiceId(invoice.id);
            console.log("[InvoiceForm] Editing state set:", {
              isEditing: true,
              editingInvoiceId: invoice.id,
            });
          } else {
            console.error("[InvoiceForm] Failed to load invoice for edit");
          }
        } catch (error) {
          console.error("Error loading invoice for edit:", error);
        }
      } else {
        console.log("[InvoiceForm] No editInvoiceId, resetting editing state");
        setIsEditing(false);
        setEditingInvoiceId(null);
      }
    };

    loadInvoiceForEdit();
  }, [editInvoiceId, dispatch, items]);

  React.useEffect(() => {
    if (onRefreshRef) {
      onRefreshRef.current = loadData;
    }
  }, [loadData, onRefreshRef]);

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
            const lastInvoiceResult = await dispatch(
              getLastInvoiceByCompanyIdThunk({ companyId: company.id })
            );
            let nextInvoiceCount = company.invoiceCount;

            if (
              getLastInvoiceByCompanyIdThunk.fulfilled.match(
                lastInvoiceResult
              ) &&
              lastInvoiceResult.payload
            ) {
              const lastInvoice = lastInvoiceResult.payload;
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
  }, [invoiceData.companyId, companies, invoiceData.invoiceDate, dispatch]);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setInvoiceData((prev) => ({ ...prev, image: base64String }));
    };
    reader.onerror = () => {
      alert("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setInvoiceData((prev) => ({ ...prev, image: null }));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setInvoiceData((prev) => {
      const newItems = [...prev.items];
      const oldItem = newItems[index];
      const item = { ...newItems[index], [field]: value };

      if (field === "quantity" || field === "rate") {
        item.amount = (item.quantity || 0) * (item.rate || 0);
      }

      if (field === "itemId" && oldItem.itemId && oldItem.itemId !== value) {
        setOutOfStockItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(oldItem.itemId);
          return newSet;
        });
        setConsentGivenItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(oldItem.itemId);
          return newSet;
        });
      }

      newItems[index] = item;

      if (field === "quantity" && item.itemId) {
        const quantity = typeof value === "number" ? value : parseFloat(String(value)) || 0;
        const availability = checkQuantityAvailability(item.itemId, quantity);

        if (availability && availability.exceeds && quantity > 0) {
          const itemData = items.find((i) => i.id === item.itemId);
          if (itemData && !consentGivenItems.has(item.itemId)) {
            setPendingConsentItem({
              itemId: item.itemId,
              itemName: itemData.itemName,
              requestedQty: quantity,
              availableQty: availability.available,
              index,
            });
            setOutOfStockItems((prev) => new Set(prev).add(item.itemId));
            return prev;
          } else if (availability && availability.exceeds) {
            setOutOfStockItems((prev) => new Set(prev).add(item.itemId));
          } else {
            setOutOfStockItems((prev) => {
              const newSet = new Set(prev);
              newSet.delete(item.itemId);
              return newSet;
            });
          }
        } else if (availability && !availability.exceeds) {
          setOutOfStockItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(item.itemId);
            return newSet;
          });
        }
      }

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
          const newQuantity = (currentItem.quantity || 0) + 1;
          currentItem.quantity = newQuantity;
          currentItem.amount = newQuantity * (currentItem.rate || 0);

          const availability = checkQuantityAvailability(itemId, newQuantity);
          if (availability && availability.exceeds && !consentGivenItems.has(itemId)) {
            setPendingConsentItem({
              itemId,
              itemName: item.itemName,
              requestedQty: newQuantity,
              availableQty: availability.available,
              index,
            });
            setOutOfStockItems((prev) => new Set(prev).add(itemId));
            return prev;
          } else if (availability && availability.exceeds) {
            setOutOfStockItems((prev) => new Set(prev).add(itemId));
          }

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
          const newQuantity = (existingItem.quantity || 0) + 1;
          existingItem.quantity = newQuantity;
          existingItem.amount = newQuantity * (existingItem.rate || 0);

          const availability = checkQuantityAvailability(itemId, newQuantity);
          if (availability && availability.exceeds && !consentGivenItems.has(itemId)) {
            setPendingConsentItem({
              itemId,
              itemName: item.itemName,
              requestedQty: newQuantity,
              availableQty: availability.available,
              index: existingItemIndex,
            });
            setOutOfStockItems((prev) => new Set(prev).add(itemId));
            return prev;
          } else if (availability && availability.exceeds) {
            setOutOfStockItems((prev) => new Set(prev).add(itemId));
          }

          newItems.splice(index, 1);
          newItems.forEach((invItem, i) => {
            invItem.serialNumber = i + 1;
          });

          return { ...prev, items: newItems };
        }

        const initialQuantity = newItems[index].quantity || 1;
        const availability = checkQuantityAvailability(itemId, initialQuantity);
        if (availability && availability.exceeds && !consentGivenItems.has(itemId)) {
          setPendingConsentItem({
            itemId,
            itemName: item.itemName,
            requestedQty: initialQuantity,
            availableQty: availability.available,
            index,
          });
          setOutOfStockItems((prev) => new Set(prev).add(itemId));
          return prev;
        } else if (availability && availability.exceeds) {
          setOutOfStockItems((prev) => new Set(prev).add(itemId));
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
          quantity: initialQuantity,
          amount: initialQuantity * (parseFloat(item.rate) || 0),
        };
        return { ...prev, items: newItems };
      });
    },
    [items, consentGivenItems]
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
      const itemToRemove = prev.items[index];
      const newItems = prev.items.filter((_, i) => i !== index);
      newItems.forEach((item, i) => {
        item.serialNumber = i + 1;
      });

      if (itemToRemove?.itemId) {
        setOutOfStockItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemToRemove.itemId);
          return newSet;
        });
        setConsentGivenItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemToRemove.itemId);
          return newSet;
        });
      }

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
    const result = await dispatch(createCompanyThunk({ company: data }));
    if (createCompanyThunk.fulfilled.match(result)) {
      const newCompany = result.payload;
      await loadData();
      setInvoiceData((prev) => ({ ...prev, companyId: newCompany.id }));
      setCompanyDialogOpen(false);
      setCompanyFormData(initialCompanyData);
    }
  };

  const handleClientSubmit = async (data: ClientFormData) => {
    const result = await dispatch(createClientThunk({ client: data }));
    if (createClientThunk.fulfilled.match(result)) {
      const newClient = result.payload;
      await loadData();
      setInvoiceData((prev) => ({ ...prev, clientId: newClient.id }));
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

  const generateInvoiceId = React.useCallback(() => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `invoice-${timestamp}-${random}`;
  }, []);

  const generateUniqueInvoiceNumber = React.useCallback(
    async (companyId: string, invoiceDate: string): Promise<string> => {
      const company = companies.find((c) => c.id === companyId);
      if (!company || !company.invoiceNumberInitial) {
        return `INV-${Date.now()}`;
      }

      const lastInvoiceResult = await dispatch(
        getLastInvoiceByCompanyIdThunk({ companyId })
      );
      let nextInvoiceCount = company.invoiceCount;

      if (
        getLastInvoiceByCompanyIdThunk.fulfilled.match(lastInvoiceResult) &&
        lastInvoiceResult.payload
      ) {
        const lastInvoice = lastInvoiceResult.payload;
        const invoiceNumberParts = lastInvoice.invoiceNumber.split("/");
        if (invoiceNumberParts.length === 3) {
          const lastCount = parseInt(invoiceNumberParts[1], 10);
          if (!isNaN(lastCount)) {
            nextInvoiceCount = lastCount;
          }
        }
      }

      const invoiceDateObj = new Date(invoiceDate);
      const year = invoiceDateObj.getFullYear();
      const nextYear = String(year + 1).slice(-2);
      const currentYear = String(year).slice(-2);

      let attemptCount = 0;
      let invoiceNumber = "";
      const invoicesResult = await dispatch(fetchInvoices());
      const existingInvoiceNumbers = new Set<string>();

      if (fetchInvoices.fulfilled.match(invoicesResult)) {
        invoicesResult.payload.forEach((inv) => {
          existingInvoiceNumbers.add(inv.invoiceNumber);
        });
      }

      do {
        nextInvoiceCount += 1;
        invoiceNumber = `${company.invoiceNumberInitial}/${String(
          nextInvoiceCount
        ).padStart(2, "0")}/${currentYear}-${nextYear}`;
        attemptCount += 1;
      } while (
        existingInvoiceNumbers.has(invoiceNumber) &&
        attemptCount < 1000
      );

      return invoiceNumber;
    },
    [companies, dispatch]
  );

  const createInvoiceFromFormData = (): Invoice => {
    const invoiceId = isEditing && editingInvoiceId ? editingInvoiceId : generateInvoiceId();
    return {
      id: invoiceId,
      companyId: invoiceData.companyId,
      clientId: invoiceData.clientId,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: null,
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
      image: invoiceData.image || null,
    };
  };

  const handlePreview = async () => {
    if (!selectedCompany || !selectedClient) {
      alert("Please select company and client first.");
      return;
    }

    if (
      !invoiceData.companyId ||
      !invoiceData.clientId ||
      invoiceData.items.length === 0
    ) {
      alert("Please fill in all required fields and add at least one item.");
      return;
    }

    try {
      const tempInvoice = createInvoiceFromFormData();
      const blob = await generatePDF(tempInvoice, selectedCompany, selectedClient);
      setPreviewPdfBlob(blob);
      setPreviewTitle(
        isEditing
          ? `Preview Invoice ${invoiceData.invoiceNumber}`
          : "Preview Invoice"
      );
      setPreviewFilename(`invoice_${invoiceData.invoiceNumber}.pdf`);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Failed to generate preview:", error);
      alert("Failed to generate preview. Please try again.");
    }
  };

  const handleSave = async (skipReset = false): Promise<Invoice | null> => {
    if (isEditing && editingInvoiceId) {
      console.log(
        "[InvoiceForm] handleSave called - editing mode, calling handleUpdate"
      );
      return handleUpdate(skipReset);
    }
    console.log("[InvoiceForm] handleSave called - creating new invoice");
    console.log("[InvoiceForm] invoiceData:", {
      companyId: invoiceData.companyId,
      clientId: invoiceData.clientId,
      itemsCount: invoiceData.items.length,
      invoiceDate: invoiceData.invoiceDate,
    });

    if (
      !invoiceData.companyId ||
      !invoiceData.clientId ||
      invoiceData.items.length === 0
    ) {
      console.log("[InvoiceForm] Validation failed - missing required fields");
      alert("Please fill in all required fields and add at least one item.");
      return null;
    }

    if (!selectedCompany) {
      console.log("[InvoiceForm] Validation failed - no company selected");
      alert("Please select a company.");
      return null;
    }

    console.log("[InvoiceForm] Generating unique invoice number...");
    const uniqueInvoiceNumber = await generateUniqueInvoiceNumber(
      invoiceData.companyId,
      invoiceData.invoiceDate
    );
    console.log("[InvoiceForm] Generated invoice number:", uniqueInvoiceNumber);

    const invoiceId = generateInvoiceId();
    console.log("[InvoiceForm] Generated invoice ID:", invoiceId);

    const invoicePayload = {
      id: invoiceId,
      companyId: invoiceData.companyId,
      clientId: invoiceData.clientId,
      invoiceNumber: uniqueInvoiceNumber,
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
        buyerOrderNumber: uniqueInvoiceNumber,
        destination: invoiceData.destination,
        gstSlab: invoiceData.gstSlab,
        declaration: invoiceData.declaration,
      }),
      image: invoiceData.image || null,
    };

    console.log("[InvoiceForm] Invoice payload prepared:", {
      id: invoicePayload.id,
      companyId: invoicePayload.companyId,
      clientId: invoicePayload.clientId,
      invoiceNumber: invoicePayload.invoiceNumber,
      totalAmount: invoicePayload.totalAmount,
    });

    console.log("[InvoiceForm] Dispatching createInvoiceThunk...");
    let result = await dispatch(
      createInvoiceThunk({
        invoice: {
          id: invoiceId,
          companyId: invoicePayload.companyId,
          clientId: invoicePayload.clientId,
          invoiceNumber: invoicePayload.invoiceNumber,
          invoiceDate: invoicePayload.invoiceDate,
          dueDate: null,
          items: invoicePayload.items,
          subtotal: invoicePayload.subtotal,
          taxAmount: invoicePayload.taxAmount,
          totalAmount: invoicePayload.totalAmount,
          status: invoicePayload.status,
          notes: invoicePayload.notes,
          image: invoicePayload.image,
        },
      })
    );
    console.log("[InvoiceForm] createInvoiceThunk result:", {
      type: result.type,
      fulfilled: createInvoiceThunk.fulfilled.match(result),
      rejected: createInvoiceThunk.rejected.match(result),
      error: createInvoiceThunk.rejected.match(result) ? result.error : null,
    });
    let finalInvoiceNumber = uniqueInvoiceNumber;
    let retryCount = 0;
    const maxRetries = 5;

    while (
      !createInvoiceThunk.fulfilled.match(result) &&
      retryCount < maxRetries
    ) {
      const errorMessage = createInvoiceThunk.rejected.match(result)
        ? (result.error as string) || ""
        : "";
      if (
        errorMessage.includes("UNIQUE constraint") ||
        errorMessage.includes("invoice_number")
      ) {
        retryCount += 1;
        finalInvoiceNumber = await generateUniqueInvoiceNumber(
          invoiceData.companyId,
          invoiceData.invoiceDate
        );
        invoicePayload.invoiceNumber = finalInvoiceNumber;
        invoicePayload.notes = JSON.stringify({
          ...JSON.parse(invoicePayload.notes as string),
          buyerOrderNumber: finalInvoiceNumber,
        });
        result = await dispatch(
          createInvoiceThunk({
            invoice: {
              id: invoiceId,
              companyId: invoicePayload.companyId,
              clientId: invoicePayload.clientId,
              invoiceNumber: invoicePayload.invoiceNumber,
              invoiceDate: invoicePayload.invoiceDate,
              dueDate: null,
              items: invoicePayload.items,
              subtotal: invoicePayload.subtotal,
              taxAmount: invoicePayload.taxAmount,
              totalAmount: invoicePayload.totalAmount,
              status: invoicePayload.status,
              notes: invoicePayload.notes,
              image: invoicePayload.image,
            },
          })
        );
      } else {
        break;
      }
    }

    if (createInvoiceThunk.fulfilled.match(result)) {
      console.log(
        "[InvoiceForm] Invoice created successfully! Invoice:",
        result.payload
      );
      console.log("[InvoiceForm] Updating company invoice count...");

      const invoiceNumberParts = finalInvoiceNumber.split("/");
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

      console.log("[InvoiceForm] New invoice count:", newInvoiceCount);
      console.log("[InvoiceForm] Dispatching updateCompanyThunk...");
      const companyUpdateResult = await dispatch(
        updateCompanyThunk({
          id: selectedCompany.id,
          data: { invoiceCount: newInvoiceCount } as Partial<Company>,
        })
      );
      console.log("[InvoiceForm] Company update result:", {
        type: companyUpdateResult.type,
        fulfilled: updateCompanyThunk.fulfilled.match(companyUpdateResult),
      });

      console.log("[InvoiceForm] Verifying invoice still exists in DB...");
      const verifyResult = await dispatch(fetchInvoices());
      if (fetchInvoices.fulfilled.match(verifyResult)) {
        const invoiceExists = verifyResult.payload.some(
          (inv) => inv.id === invoiceId
        );
        console.log("[InvoiceForm] Invoice verification:", {
          invoiceId,
          exists: invoiceExists,
          totalInvoices: verifyResult.payload.length,
        });
        if (!invoiceExists) {
          console.error(
            "[InvoiceForm] ERROR: Invoice was deleted after creation!"
          );
        }
      }

      if (!skipReset) {
        alert("Invoice saved successfully!");
        setInvoiceData(initialInvoiceData);
        setOutOfStockItems(new Set());
        setConsentGivenItems(new Set());
        setPendingConsentItem(null);
        console.log("[InvoiceForm] Calling loadData()...");
        await loadData();
        console.log("[InvoiceForm] loadData() completed");
      }

      return result.payload;
    } else {
      console.error("[InvoiceForm] Invoice creation failed:", result);
      alert("Failed to save invoice. Please try again.");
      return null;
    }
  };

  const handleUpdate = async (skipReset = false): Promise<Invoice | null> => {
    if (!editingInvoiceId) {
      console.error(
        "[InvoiceForm] handleUpdate called but editingInvoiceId is null"
      );
      return null;
    }

    console.log(
      "[InvoiceForm] handleUpdate called for invoice ID:",
      editingInvoiceId
    );

    if (
      !invoiceData.companyId ||
      !invoiceData.clientId ||
      invoiceData.items.length === 0
    ) {
      alert("Please fill in all required fields and add at least one item.");
      return null;
    }

    if (!selectedCompany) {
      alert("Please select a company.");
      return null;
    }

    try {
      console.log(
        "[InvoiceForm] Dispatching updateInvoiceThunk with ID:",
        editingInvoiceId
      );
      const result = await dispatch(
        updateInvoiceThunk({
          id: editingInvoiceId,
          invoice: {
            companyId: invoiceData.companyId,
            clientId: invoiceData.clientId,
            invoiceNumber: invoiceData.invoiceNumber,
            invoiceDate: invoiceData.invoiceDate,
            dueDate: null,
            items: JSON.stringify(invoiceData.items),
            subtotal: totals.totalAmountBeforeTax,
            taxAmount: totals.totalTaxAmount,
            totalAmount: totals.totalInvoiceAmount,
            status: "draft",
            notes: JSON.stringify({
              deliveryNote: invoiceData.deliveryNote,
              modeOfPayment: invoiceData.modeOfPayment,
              supplierReference: invoiceData.supplierReference,
              buyerOrderNumber: invoiceData.invoiceNumber,
              destination: invoiceData.destination,
              gstSlab: invoiceData.gstSlab,
              declaration: invoiceData.declaration,
            }),
            image: invoiceData.image || null,
          },
        })
      );

      console.log("[InvoiceForm] updateInvoiceThunk result:", {
        type: result.type,
        fulfilled: updateInvoiceThunk.fulfilled.match(result),
        rejected: updateInvoiceThunk.rejected.match(result),
      });

      if (updateInvoiceThunk.fulfilled.match(result)) {
        const updatedInvoice = await dispatch(
          getInvoiceByIdThunk({ id: editingInvoiceId })
        );

        if (!skipReset) {
          alert("Invoice updated successfully!");
          setInvoiceData(initialInvoiceData);
          setIsEditing(false);
          setEditingInvoiceId(null);
          setOutOfStockItems(new Set());
          setConsentGivenItems(new Set());
          setPendingConsentItem(null);
          await loadData();
        }

        return getInvoiceByIdThunk.fulfilled.match(updatedInvoice) &&
          updatedInvoice.payload
          ? (updatedInvoice.payload as Invoice)
          : null;
      } else {
        const errorMessage = updateInvoiceThunk.rejected.match(result)
          ? (result.error as string) || "Unknown error"
          : "Failed to update invoice";
        console.error("[InvoiceForm] Update failed:", errorMessage);
        alert(`Failed to update invoice: ${errorMessage}`);
        return null;
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Failed to update invoice. Please try again.");
      return null;
    }
  };

  const generatePDF = async (
    invoice: Invoice,
    company: Company,
    client: Client
  ): Promise<Blob> => {
    const html = renderToStaticMarkup(
      <InvoicePDF invoice={invoice} company={company} client={client} />
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
    if (!selectedCompany || !selectedClient) {
      alert("Please select company and client first.");
      return;
    }

    const savedInvoice = await handleSave(true);
    if (!savedInvoice) {
      return;
    }

    try {
      const blob = await generatePDF(
        savedInvoice,
        selectedCompany,
        selectedClient
      );
      await downloadPDF(blob, `invoice_${savedInvoice.invoiceNumber}.pdf`);
      alert(
        isEditing
          ? "Invoice updated and downloaded successfully!"
          : "Invoice saved and downloaded successfully!"
      );
      setInvoiceData(initialInvoiceData);
      setIsEditing(false);
      setEditingInvoiceId(null);
      setOutOfStockItems(new Set());
      setConsentGivenItems(new Set());
      setPendingConsentItem(null);
      await loadData();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert(
        isEditing
          ? "Invoice updated but failed to generate PDF. Please try again."
          : "Invoice saved but failed to generate PDF. Please try again."
      );
    }
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
                  {invoiceData.items.map((item, index) => {
                    const isOutOfStock = item.itemId
                      ? outOfStockItems.has(item.itemId)
                      : false;
                    const itemData = items.find((i) => i.id === item.itemId);
                    const availableQty = itemData
                      ? parseFloat(itemData.qtyAvailable) || 0
                      : null;

                    return (
                      <tr
                        key={item.id}
                        className={isOutOfStock ? "bg-destructive/10" : ""}
                      >
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
                        <div className="space-y-1">
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
                            className={
                              isOutOfStock
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }
                          />
                          {isOutOfStock && availableQty !== null && (
                            <p className="text-xs text-destructive font-medium">
                              Available: {availableQty.toLocaleString()}{" "}
                              {item.unit || ""}
                            </p>
                          )}
                        </div>
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
                    );
                  })}
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

            <Separator />

            <div className="space-y-4">
              <Label>Invoice Image (Optional)</Label>
              <div className="space-y-2">
                {invoiceData.image ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={invoiceData.image}
                      alt="Invoice preview"
                      className="max-w-full max-h-64 object-contain border rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleImageRemove}
                      className="mt-2"
                    >
                      <XIcon className="size-4 mr-2" />
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="invoice-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById(
                          "invoice-image-upload"
                        ) as HTMLInputElement;
                        if (input) {
                          input.click();
                        }
                      }}
                    >
                      <UploadIcon className="size-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
            >
              <EyeIcon className="size-4 mr-2" />
              Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadAndSave}
            >
              <DownloadIcon className="size-4 mr-2" />
              Download PDF
            </Button>
            <Button type="button" onClick={async () => {
              if (!selectedCompany || !selectedClient) {
                alert("Please select company and client first.");
                return;
              }

              if (
                !invoiceData.companyId ||
                !invoiceData.clientId ||
                invoiceData.items.length === 0
              ) {
                alert("Please fill in all required fields and add at least one item.");
                return;
              }

              setPendingSave(true);
              try {
                const tempInvoice = createInvoiceFromFormData();
                const blob = await generatePDF(tempInvoice, selectedCompany, selectedClient);
                setPreviewPdfBlob(blob);
                setPreviewTitle(
                  isEditing
                    ? `Preview Invoice ${invoiceData.invoiceNumber}`
                    : "Preview Invoice"
                );
                setPreviewFilename(`invoice_${invoiceData.invoiceNumber}.pdf`);
                setPreviewOpen(true);
              } catch (error) {
                console.error("Failed to generate preview:", error);
                alert("Failed to generate preview. Please try again.");
                setPendingSave(false);
              }
            }}>
              <SaveIcon className="size-4 mr-2" />
              {isEditing ? "Update Invoice" : "Save Invoice"}
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

      <AlertDialog
        open={pendingConsentItem !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingConsentItem(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Inventory</AlertDialogTitle>
            <AlertDialogDescription>
              The quantity requested for{" "}
              <strong>{pendingConsentItem?.itemName}</strong> exceeds the
              available inventory.
              <br />
              <br />
              <strong>Requested:</strong>{" "}
              {pendingConsentItem?.requestedQty.toLocaleString()}{" "}
              {invoiceData.items.find(
                (i) => i.itemId === pendingConsentItem?.itemId
              )?.unit || ""}
              <br />
              <strong>Available:</strong>{" "}
              {pendingConsentItem?.availableQty.toLocaleString()}{" "}
              {invoiceData.items.find(
                (i) => i.itemId === pendingConsentItem?.itemId
              )?.unit || ""}
              <br />
              <br />
              Do you want to proceed with creating the invoice despite the
              insufficient inventory? This will allow you to create the invoice
              but the item will be marked as out of stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (pendingConsentItem) {
                  setInvoiceData((prev) => {
                    const newItems = [...prev.items];
                    const item = newItems[pendingConsentItem.index];
                    if (item) {
                      item.quantity = pendingConsentItem.availableQty;
                      item.amount =
                        pendingConsentItem.availableQty * (item.rate || 0);
                    }
                    return { ...prev, items: newItems };
                  });
                  setOutOfStockItems((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(pendingConsentItem.itemId);
                    return newSet;
                  });
                }
                setPendingConsentItem(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingConsentItem) {
                  setConsentGivenItems((prev) =>
                    new Set(prev).add(pendingConsentItem.itemId)
                  );
                  setInvoiceData((prev) => {
                    const newItems = [...prev.items];
                    const item = newItems[pendingConsentItem.index];
                    if (item) {
                      item.quantity = pendingConsentItem.requestedQty;
                      item.amount =
                        pendingConsentItem.requestedQty * (item.rate || 0);
                    }
                    return { ...prev, items: newItems };
                  });
                }
                setPendingConsentItem(null);
              }}
            >
              Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={previewOpen} onOpenChange={(open) => {
        setPreviewOpen(open);
        if (!open) {
          setPendingSave(false);
        }
      }}>
        <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>{previewTitle}</DialogTitle>
              <div className="flex gap-2">
                {previewPdfBlob && previewFilename && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (previewPdfBlob && previewFilename) {
                        await downloadPDF(previewPdfBlob, previewFilename);
                      }
                    }}
                  >
                    <DownloadIcon className="size-4 mr-2" />
                    Download
                  </Button>
                )}
                {pendingSave && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={async () => {
                      setPreviewOpen(false);
                      const result = await handleSave();
                      setPendingSave(false);
                      if (result) {
                        alert(
                          isEditing
                            ? "Invoice updated successfully!"
                            : "Invoice saved successfully!"
                        );
                      }
                    }}
                  >
                    <SaveIcon className="size-4 mr-2" />
                    {isEditing ? "Update Invoice" : "Save Invoice"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setPreviewOpen(false);
                    setPendingSave(false);
                  }}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-6">
            {previewPdfUrl ? (
              <iframe
                src={previewPdfUrl}
                className="w-full h-full border-0"
                title={previewTitle}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading PDF...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
