"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Item, Client, Company } from "@/lib/types";
import { PlusIcon, TrashIcon } from "lucide-react";
import {
  ItemDialog,
  ItemFormData,
} from "@/components/molecules/ItemDialog/ItemDialog";

export interface PurchaseItem {
  id: string;
  itemId: string;
  quantity: string;
  rate: string;
  amount: string;
}

export interface PurchaseFormData {
  companyId: string;
  clientId: string;
  invoiceNumber: string;
  date: string;
  items: PurchaseItem[];
}

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseData: PurchaseFormData;
  onPurchaseDataChange: (data: PurchaseFormData) => void;
  onSubmit: (data: PurchaseFormData) => void;
  onAddItem?: (data: ItemFormData) => Promise<void>;
  items: Item[];
  clients: Client[];
  companies: Company[];
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

const initialItemData: ItemFormData = {
  itemName: "",
  itemDescription: "",
  hsnCode: "",
  qtyAvailable: "0",
  rate: "0",
  unit: "",
};

export function PurchaseDialog({
  open,
  onOpenChange,
  purchaseData,
  onPurchaseDataChange,
  onSubmit,
  onAddItem,
  items,
  clients,
  companies,
  title = "New Purchase",
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: PurchaseDialogProps) {
  const [itemDialogOpen, setItemDialogOpen] = React.useState(false);
  const [itemFormData, setItemFormData] = React.useState<ItemFormData>(initialItemData);
  const [activeRowIndex, setActiveRowIndex] = React.useState<number | null>(null);

  const handleFieldChange = <K extends keyof PurchaseFormData>(
    field: K,
    value: PurchaseFormData[K]
  ) => {
    onPurchaseDataChange({
      ...purchaseData,
      [field]: value,
    });
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: string) => {
    const newItems = [...purchaseData.items];
    const item = { ...newItems[index], [field]: value };

    if (field === "itemId") {
      const selectedItem = items.find(i => i.id === value);
      if (selectedItem) {
        item.rate = selectedItem.rate;
      }
    }

    if (field === "quantity" || field === "rate" || field === "itemId") {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      item.amount = (qty * rate).toFixed(2);
    }

    newItems[index] = item;
    onPurchaseDataChange({
      ...purchaseData,
      items: newItems,
    });
  };

  const addItemRow = () => {
    onPurchaseDataChange({
      ...purchaseData,
      items: [
        ...purchaseData.items,
        {
          id: `temp_${Date.now()}`,
          itemId: "",
          quantity: "",
          rate: "",
          amount: "0.00",
        },
      ],
    });
  };

  const removeItemRow = (index: number) => {
    const newItems = purchaseData.items.filter((_, i) => i !== index);
    onPurchaseDataChange({
      ...purchaseData,
      items: newItems,
    });
  };

  const calculateTotal = () => {
    return purchaseData.items.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
  };

  const handleItemSubmit = async (data: ItemFormData) => {
    if (onAddItem) {
      await onAddItem(data);
      setItemDialogOpen(false);
      setItemFormData(initialItemData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(purchaseData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the purchase bill details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">
                  Company <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={purchaseData.companyId}
                  onValueChange={(value) => handleFieldChange("companyId", value)}
                  required
                >
                  <SelectTrigger id="company">
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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={purchaseData.date}
                  onChange={(e) => handleFieldChange("date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client">
                  Purchased From (Client) <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={purchaseData.clientId}
                  onValueChange={(value) => handleFieldChange("clientId", value)}
                  required
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.customerType === "business"
                          ? client.companyName || `${client.firstName} ${client.lastName}`
                          : `${client.firstName} ${client.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="invoiceNumber">
                  Bill / Invoice Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invoiceNumber"
                  value={purchaseData.invoiceNumber}
                  onChange={(e) => handleFieldChange("invoiceNumber", e.target.value)}
                  placeholder="Enter bill number"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                  <PlusIcon className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>
              
              <div className="border rounded-md">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[40%]">Item</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Qty</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rate</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {purchaseData.items.map((item, index) => (
                      <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <Select
                              value={item.itemId}
                              onValueChange={(value) => handleItemChange(index, "itemId", value)}
                              required
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Item" />
                              </SelectTrigger>
                              <SelectContent>
                                {items.map((i) => (
                                  <SelectItem key={i.id} value={i.id}>
                                    {i.itemName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setActiveRowIndex(index);
                                setItemDialogOpen(true);
                              }}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            placeholder="0"
                            required
                            className="w-full"
                          />
                        </td>
                        <td className="p-4 align-middle">
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                            placeholder="0"
                            required
                            className="w-full"
                          />
                        </td>
                        <td className="p-4 align-middle">
                          <div className="font-medium">₹{item.amount}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItemRow(index)}
                          >
                            <TrashIcon className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end items-center gap-4 p-4 bg-muted/50 rounded-md">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-xl font-bold">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        itemData={itemFormData}
        onItemDataChange={setItemFormData}
        onSubmit={handleItemSubmit}
        title="Create New Item"
      />
    </Dialog>
  );
}

