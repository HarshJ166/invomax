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
import { PlusIcon } from "lucide-react";
import { Company } from "@/lib/types";
import { Client } from "@/lib/types";
import { ClientsDialog, ClientFormData } from "@/components/molecules/ClientsDialog/ClientsDialog";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchClients, createClientThunk } from "@/store/thunks/clientsThunks";

export interface DealerPaymentFormData {
  companyId: string;
  clientId: string;
  billNumber: string;
  billDate: string;
  billAmountTotal: number;
  paymentMode: "cash" | "neft" | "imps" | "upi";
  referenceNumber: string;
  paymentStatus: "paid" | "unpaid" | "partial_paid";
  paidAmount: number;
  description: string;
}

interface DealerPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealerData: DealerPaymentFormData;
  onDealerDataChange: (data: DealerPaymentFormData) => void;
  onSubmit: (data: DealerPaymentFormData) => void;
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export function DealerPaymentDialog({
  open,
  onOpenChange,
  dealerData,
  onDealerDataChange,
  onSubmit,
  title = "New Payment",
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: DealerPaymentDialogProps) {
  const companies = useAppSelector((state) => state.companies.companies);
  const clients = useAppSelector((state) => state.clients.clients);
  const dispatch = useAppDispatch();
  
  const [clientDialogOpen, setClientDialogOpen] = React.useState(false);
  const [newClientData, setNewClientData] = React.useState<ClientFormData>({
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
  });

  React.useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const handleFieldChange = <K extends keyof DealerPaymentFormData>(
    field: K,
    value: DealerPaymentFormData[K]
  ) => {
    const updatedData = {
      ...dealerData,
      [field]: value,
    };

    if (field === "paymentStatus" && value === "paid") {
      updatedData.paidAmount = updatedData.billAmountTotal;
    } else if (field === "paymentStatus" && value === "unpaid") {
      updatedData.paidAmount = 0;
    }

    if (field === "paymentMode" && value === "cash") {
      updatedData.referenceNumber = "";
    }

    onDealerDataChange(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dealerData.paymentStatus === "partial_paid" && dealerData.paidAmount >= dealerData.billAmountTotal) {
      return;
    }
    
    onSubmit(dealerData);
  };

  const handleCreateClient = async (clientFormData: ClientFormData) => {
    const result = await dispatch(createClientThunk({ client: clientFormData }));
    if (createClientThunk.fulfilled.match(result)) {
      const newClient = result.payload as Client;
      handleFieldChange("clientId", newClient.id);
      setClientDialogOpen(false);
      setNewClientData({
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
      });
    }
  };

  const selectedCompany = companies.find((c) => c.id === dealerData.companyId);
  const selectedClient = clients.find((c) => c.id === dealerData.clientId);
  const filteredClients = dealerData.companyId
    ? clients
    : clients;

  const balanceAmount = dealerData.paymentStatus === "partial_paid"
    ? dealerData.billAmountTotal - dealerData.paidAmount
    : dealerData.paymentStatus === "unpaid"
    ? dealerData.billAmountTotal
    : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Enter the dealer payment details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Company <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={dealerData.companyId}
                    onValueChange={(value) => handleFieldChange("companyId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
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
                  <Label>
                    Client <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={dealerData.clientId}
                      onValueChange={(value) => handleFieldChange("clientId", value)}
                      required
                      disabled={!dealerData.companyId}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.customerType === "business"
                              ? client.companyName || `${client.firstName} ${client.lastName}`
                              : `${client.salutation ? client.salutation + ". " : ""}${client.firstName} ${client.lastName}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setClientDialogOpen(true)}
                      disabled={!dealerData.companyId}
                    >
                      <PlusIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Bill Number / Invoice Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={dealerData.billNumber}
                    onChange={(e) => handleFieldChange("billNumber", e.target.value)}
                    placeholder="Enter bill number"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    Bill Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={dealerData.billDate}
                    onChange={(e) => handleFieldChange("billDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>
                  Bill Amount Total <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={dealerData.billAmountTotal || ""}
                  onChange={(e) =>
                    handleFieldChange("billAmountTotal", parseFloat(e.target.value) || 0)
                  }
                  placeholder="Enter total amount"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    Payment Mode <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={dealerData.paymentMode}
                    onValueChange={(value) =>
                      handleFieldChange("paymentMode", value as "cash" | "neft" | "imps" | "upi")
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="neft">NEFT</SelectItem>
                      <SelectItem value="imps">IMPS</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {dealerData.paymentMode !== "cash" && (
                  <div className="grid gap-2">
                    <Label>
                      Reference Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={dealerData.referenceNumber}
                      onChange={(e) => handleFieldChange("referenceNumber", e.target.value)}
                      placeholder="Enter reference number"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>
                  Payment Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={dealerData.paymentStatus}
                  onValueChange={(value) =>
                    handleFieldChange("paymentStatus", value as "paid" | "unpaid" | "partial_paid")
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partial_paid">Partial Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dealerData.paymentStatus === "partial_paid" && (
                <div className="grid gap-2">
                  <Label>
                    Paid Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={dealerData.billAmountTotal}
                    value={dealerData.paidAmount || ""}
                    onChange={(e) =>
                      handleFieldChange("paidAmount", parseFloat(e.target.value) || 0)
                    }
                    placeholder="Enter paid amount"
                    required
                  />
                  {balanceAmount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Balance Amount: ₹{balanceAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={dealerData.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Enter any additional notes or description"
                  rows={3}
                />
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
      <ClientsDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        clientData={newClientData}
        onClientDataChange={setNewClientData}
        onSubmit={handleCreateClient}
        title="Add New Client"
        submitLabel="Add Client"
      />
    </>
  );
}

