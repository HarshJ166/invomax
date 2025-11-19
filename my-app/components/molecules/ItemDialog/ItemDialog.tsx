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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type Unit = "kg" | "meter" | "piece" | "litre" | "bundle" | "RFT";

export interface ItemFormData {
  itemName: string;
  itemDescription: string;
  hsnCode: string;
  qtyAvailable: string;
  rate: string;
  unit: Unit | "";
}

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemData: ItemFormData;
  onItemDataChange: (data: ItemFormData) => void;
  onSubmit: (data: ItemFormData) => void;
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

const UNIT_OPTIONS: Unit[] = ["kg", "meter", "piece", "litre", "bundle", "RFT"];

export function ItemDialog({
  open,
  onOpenChange,
  itemData,
  onItemDataChange,
  onSubmit,
  title = "Add Item",
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: ItemDialogProps) {
  const handleFieldChange = <K extends keyof ItemFormData>(
    field: K,
    value: ItemFormData[K]
  ) => {
    onItemDataChange({
      ...itemData,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(itemData);
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
            Enter the details for the electronic item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="itemName">
                Item Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="itemName"
                value={itemData.itemName}
                onChange={(e) => handleFieldChange("itemName", e.target.value)}
                placeholder="Enter item name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="itemDescription">Item Description</Label>
              <Textarea
                id="itemDescription"
                value={itemData.itemDescription}
                onChange={(e) =>
                  handleFieldChange("itemDescription", e.target.value)
                }
                placeholder="Enter item description"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hsnCode">
                HSN Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hsnCode"
                value={itemData.hsnCode}
                onChange={(e) => handleFieldChange("hsnCode", e.target.value)}
                placeholder="Enter HSN code"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="qtyAvailable">
                  Qty Available <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="qtyAvailable"
                  type="number"
                  value={itemData.qtyAvailable}
                  onChange={(e) =>
                    handleFieldChange("qtyAvailable", e.target.value)
                  }
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
                  value={itemData.rate}
                  onChange={(e) => handleFieldChange("rate", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">
                Unit <span className="text-destructive">*</span>
              </Label>
              <Select
                value={itemData.unit}
                onValueChange={(value) =>
                  handleFieldChange("unit", value as Unit)
                }
                required
              >
                <SelectTrigger id="unit" className="w-full">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
