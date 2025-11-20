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
import { Item, Client } from "@/lib/types";

export interface PurchaseFormData {
  itemId: string;
  clientId: string;
  quantity: string;
  rate: string;
  amount: string;
  date: string;
}

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseData: PurchaseFormData;
  onPurchaseDataChange: (data: PurchaseFormData) => void;
  onSubmit: (data: PurchaseFormData) => void;
  items: Item[];
  clients: Client[];
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export function PurchaseDialog({
  open,
  onOpenChange,
  purchaseData,
  onPurchaseDataChange,
  onSubmit,
  items,
  clients,
  title = "New Purchase",
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: PurchaseDialogProps) {
  const handleFieldChange = <K extends keyof PurchaseFormData>(
    field: K,
    value: PurchaseFormData[K]
  ) => {
    const newData = {
      ...purchaseData,
      [field]: value,
    };

    if (field === "quantity" || field === "rate") {
      const qty = field === "quantity" ? parseFloat(value) : parseFloat(purchaseData.quantity);
      const rate = field === "rate" ? parseFloat(value) : parseFloat(purchaseData.rate);
      
      if (!isNaN(qty) && !isNaN(rate)) {
        newData.amount = (qty * rate).toFixed(2);
      }
    }

    onPurchaseDataChange(newData);
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
      <DialogContent className="sm:max-w-[50%]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the details for the new purchase.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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

            <div className="grid gap-2">
              <Label htmlFor="item">
                Item <span className="text-destructive">*</span>
              </Label>
              <Select
                value={purchaseData.itemId}
                onValueChange={(value) => handleFieldChange("itemId", value)}
                required
              >
                <SelectTrigger id="item">
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.itemName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={purchaseData.quantity}
                  onChange={(e) => handleFieldChange("quantity", e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rate">
                  Rate <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rate"
                  type="number"
                  value={purchaseData.rate}
                  onChange={(e) => handleFieldChange("rate", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={purchaseData.amount}
                  readOnly
                  className="bg-muted"
                  placeholder="0.00"
                />
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
    </Dialog>
  );
}

