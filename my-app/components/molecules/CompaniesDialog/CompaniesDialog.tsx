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
import { MailIcon, PhoneIcon, XIcon } from "lucide-react";
import { STATE_CITY_MAPPING, INDIAN_STATES } from "@/lib/constants";

const FilePreview = ({
  preview,
  onRemove,
}: {
  preview: string;
  onRemove: () => void;
}) => (
  <div className="relative mt-2 border rounded p-2">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={preview} alt="Preview" className="max-h-24 object-contain" />
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="absolute top-1 right-1"
      onClick={onRemove}
    >
      <XIcon className="size-4" />
    </Button>
  </div>
);

export interface CompanyFormData {
  companyName: string;
  proprietor: string;
  address: string;
  email: string;
  phoneNumber: string;
  state: string;
  city: string;
  gstNumber: string;
  invoiceNumberInitial: string;
  logo: File | null;
  logoPreview: string;
  signature: File | null;
  signaturePreview: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branch: string;
}

interface CompaniesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyData: CompanyFormData;
  onCompanyDataChange: (data: CompanyFormData) => void;
  onSubmit: (data: CompanyFormData) => void;
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export function CompaniesDialog({
  open,
  onOpenChange,
  companyData,
  onCompanyDataChange,
  onSubmit,
  title = "Add Company",
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: CompaniesDialogProps) {
  const availableCities = companyData.state
    ? STATE_CITY_MAPPING[companyData.state] || []
    : [];

  const handleFieldChange = <K extends keyof CompanyFormData>(
    field: K,
    value: CompanyFormData[K]
  ) => {
    onCompanyDataChange({
      ...companyData,
      [field]: value,
      ...(field === "state" && { city: "" }),
    });
  };

  const handleFileChange = (field: "logo" | "signature", file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onCompanyDataChange({
          ...companyData,
          [field]: file,
          [`${field}Preview`]: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      onCompanyDataChange({
        ...companyData,
        [field]: null,
        [`${field}Preview`]: "",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(companyData);
  };

  const formatStateName = (state: string) =>
    state
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the company details and bank information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                value={companyData.companyName}
                onChange={(e) =>
                  handleFieldChange("companyName", e.target.value)
                }
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proprietor">
                Company Proprietor <span className="text-destructive">*</span>
              </Label>
              <Input
                id="proprietor"
                value={companyData.proprietor}
                onChange={(e) =>
                  handleFieldChange("proprietor", e.target.value)
                }
                placeholder="Enter proprietor name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                value={companyData.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder="Enter complete address"
                rows={2}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="state">
                  State <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={companyData.state}
                  onValueChange={(value) => handleFieldChange("state", value)}
                  required
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {formatStateName(state)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">
                  City <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={companyData.city}
                  onValueChange={(value) => handleFieldChange("city", value)}
                  disabled={!companyData.state}
                  required
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email ID <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={companyData.phoneNumber}
                    onChange={(e) =>
                      handleFieldChange("phoneNumber", e.target.value)
                    }
                    placeholder="Enter phone number"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gstNumber">
                  GST Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="gstNumber"
                  value={companyData.gstNumber}
                  onChange={(e) =>
                    handleFieldChange("gstNumber", e.target.value)
                  }
                  placeholder="Enter GST number"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoiceNumberInitial">
                  Invoice Number Initial{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invoiceNumberInitial"
                  value={companyData.invoiceNumberInitial}
                  onChange={(e) =>
                    handleFieldChange("invoiceNumberInitial", e.target.value)
                  }
                  placeholder="Enter invoice prefix"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="logo">Company Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange("logo", e.target.files?.[0] || null)
                  }
                />
                {companyData.logoPreview && (
                  <FilePreview
                    preview={companyData.logoPreview}
                    onRemove={() => handleFileChange("logo", null)}
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signature">Proprietor Signature</Label>
                <Input
                  id="signature"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange("signature", e.target.files?.[0] || null)
                  }
                />
                {companyData.signaturePreview && (
                  <FilePreview
                    preview={companyData.signaturePreview}
                    onRemove={() => handleFileChange("signature", null)}
                  />
                )}
              </div>
            </div>
            <div className="border-t pt-4 mt-2">
              <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="accountNumber">
                      Account Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="accountNumber"
                      value={companyData.accountNumber}
                      onChange={(e) =>
                        handleFieldChange("accountNumber", e.target.value)
                      }
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bankName">
                      Bank Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bankName"
                      value={companyData.bankName}
                      onChange={(e) =>
                        handleFieldChange("bankName", e.target.value)
                      }
                      placeholder="Enter bank name"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ifscCode">
                      IFSC Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="ifscCode"
                      value={companyData.ifscCode}
                      onChange={(e) =>
                        handleFieldChange("ifscCode", e.target.value)
                      }
                      placeholder="Enter IFSC code"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="branch">
                      Branch <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="branch"
                      value={companyData.branch}
                      onChange={(e) =>
                        handleFieldChange("branch", e.target.value)
                      }
                      placeholder="Enter branch name"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
