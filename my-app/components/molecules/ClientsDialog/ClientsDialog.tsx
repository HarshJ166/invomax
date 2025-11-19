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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MailIcon, PhoneIcon, CopyIcon } from "lucide-react";
import { INDIAN_STATES } from "@/lib/constants";
import { formatStateName } from "@/lib/formatters";
import { useStateCitySelection } from "@/hooks/use-state-city-selection";

export interface ClientFormData {
  customerType: "business" | "individual";
  salutation: "mr" | "ms" | "mrs";
  firstName: string;
  lastName: string;
  panNumber: string;
  companyName: string;
  currency: string;
  gstApplicable: boolean;
  gstin: string;
  stateCode: string;
  billingCountry: string;
  billingState: string;
  billingCity: string;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingContactNo: string;
  billingEmail: string;
  billingAlternateContactNo: string;
  shippingCountry: string;
  shippingState: string;
  shippingCity: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingContactNo: string;
  shippingEmail: string;
  shippingAlternateContactNo: string;
}

interface ClientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientData: ClientFormData;
  onClientDataChange: (data: ClientFormData) => void;
  onSubmit: (data: ClientFormData) => void;
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export function ClientsDialog({
  open,
  onOpenChange,
  clientData,
  onClientDataChange,
  onSubmit,
  title = "Add Client",
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: ClientsDialogProps) {
  const { availableCities: billingCities } = useStateCitySelection({
    selectedState: clientData.billingState,
  });
  const { availableCities: shippingCities } = useStateCitySelection({
    selectedState: clientData.shippingState,
  });

  const handleFieldChange = <K extends keyof ClientFormData>(
    field: K,
    value: ClientFormData[K]
  ) => {
    onClientDataChange({
      ...clientData,
      [field]: value,
      ...(field === "billingState" && { billingCity: "" }),
      ...(field === "shippingState" && { shippingCity: "" }),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(clientData);
  };

  const copyBillingToShipping = () => {
    onClientDataChange({
      ...clientData,
      shippingCountry: clientData.billingCountry,
      shippingState: clientData.billingState,
      shippingCity: clientData.billingCity,
      shippingAddressLine1: clientData.billingAddressLine1,
      shippingAddressLine2: clientData.billingAddressLine2,
      shippingContactNo: clientData.billingContactNo,
      shippingEmail: clientData.billingEmail,
      shippingAlternateContactNo: clientData.billingAlternateContactNo,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enter the client details and address information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Customer Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="business"
                    checked={clientData.customerType === "business"}
                    onChange={() =>
                      handleFieldChange("customerType", "business")
                    }
                  />
                  <span>Business</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="individual"
                    checked={clientData.customerType === "individual"}
                    onChange={() =>
                      handleFieldChange("customerType", "individual")
                    }
                  />
                  <span>Individual</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Salutation</Label>
                <Select
                  value={clientData.salutation}
                  onValueChange={(value) =>
                    handleFieldChange(
                      "salutation",
                      value as "mr" | "ms" | "mrs"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Mr.</SelectItem>
                    <SelectItem value="ms">Ms.</SelectItem>
                    <SelectItem value="mrs">Mrs.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={clientData.firstName}
                  onChange={(e) =>
                    handleFieldChange("firstName", e.target.value)
                  }
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={clientData.lastName}
                  onChange={(e) =>
                    handleFieldChange("lastName", e.target.value)
                  }
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>PAN Number</Label>
                <Input
                  value={clientData.panNumber}
                  onChange={(e) =>
                    handleFieldChange("panNumber", e.target.value)
                  }
                  placeholder="Enter PAN Number"
                />
              </div>
              <div className="grid gap-2">
                <Label>Company Name</Label>
                <Input
                  value={clientData.companyName}
                  onChange={(e) =>
                    handleFieldChange("companyName", e.target.value)
                  }
                  placeholder="Company Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Select
                  value={clientData.currency}
                  onValueChange={(value) =>
                    handleFieldChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                    <SelectItem value="eur">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">
                  Is GST Applicable?
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gstApplicable"
                      checked={clientData.gstApplicable === true}
                      onChange={() => handleFieldChange("gstApplicable", true)}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gstApplicable"
                      checked={clientData.gstApplicable === false}
                      onChange={() => handleFieldChange("gstApplicable", false)}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>

            {clientData.gstApplicable && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>GSTIN/UIN</Label>
                  <Input
                    value={clientData.gstin}
                    onChange={(e) => handleFieldChange("gstin", e.target.value)}
                    placeholder="GST Number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>State Code</Label>
                  <Input
                    value={clientData.stateCode}
                    onChange={(e) =>
                      handleFieldChange("stateCode", e.target.value)
                    }
                    placeholder="State Code"
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <Tabs defaultValue="billing">
                <TabsList className="grid w-[300px] grid-cols-2">
                  <TabsTrigger value="billing">Billing Address</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping Address</TabsTrigger>
                </TabsList>

                <TabsContent value="billing" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Country/Region</Label>
                      <Select
                        value={clientData.billingCountry}
                        onValueChange={(value) =>
                          handleFieldChange("billingCountry", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>State</Label>
                      <Select
                        value={clientData.billingState}
                        onValueChange={(value) =>
                          handleFieldChange("billingState", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Address Line 1</Label>
                      <Textarea
                        value={clientData.billingAddressLine1}
                        onChange={(e) =>
                          handleFieldChange(
                            "billingAddressLine1",
                            e.target.value
                          )
                        }
                        placeholder="Street Address"
                        rows={2}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Address Line 2</Label>
                      <Textarea
                        value={clientData.billingAddressLine2}
                        onChange={(e) =>
                          handleFieldChange(
                            "billingAddressLine2",
                            e.target.value
                          )
                        }
                        placeholder="Locality, Area"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>City</Label>
                      <Select
                        value={clientData.billingCity}
                        onValueChange={(value) =>
                          handleFieldChange("billingCity", value)
                        }
                        disabled={!clientData.billingState}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          {billingCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Contact No.</Label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          value={clientData.billingContactNo}
                          onChange={(e) =>
                            handleFieldChange(
                              "billingContactNo",
                              e.target.value
                            )
                          }
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Email Address</Label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          type="email"
                          value={clientData.billingEmail}
                          onChange={(e) =>
                            handleFieldChange("billingEmail", e.target.value)
                          }
                          placeholder="Email"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Alternate Contact No.</Label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          value={clientData.billingAlternateContactNo}
                          onChange={(e) =>
                            handleFieldChange(
                              "billingAlternateContactNo",
                              e.target.value
                            )
                          }
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="mt-4 space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyBillingToShipping}
                    className="mb-4"
                  >
                    <CopyIcon className="size-4 mr-2" />
                    Same as Billing Address
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Country/Region</Label>
                      <Select
                        value={clientData.shippingCountry}
                        onValueChange={(value) =>
                          handleFieldChange("shippingCountry", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="india">India</SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>State</Label>
                      <Select
                        value={clientData.shippingState}
                        onValueChange={(value) =>
                          handleFieldChange("shippingState", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Address Line 1</Label>
                      <Textarea
                        value={clientData.shippingAddressLine1}
                        onChange={(e) =>
                          handleFieldChange(
                            "shippingAddressLine1",
                            e.target.value
                          )
                        }
                        placeholder="Street Address"
                        rows={2}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Address Line 2</Label>
                      <Textarea
                        value={clientData.shippingAddressLine2}
                        onChange={(e) =>
                          handleFieldChange(
                            "shippingAddressLine2",
                            e.target.value
                          )
                        }
                        placeholder="Locality, Area"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>City</Label>
                      <Select
                        value={clientData.shippingCity}
                        onValueChange={(value) =>
                          handleFieldChange("shippingCity", value)
                        }
                        disabled={!clientData.shippingState}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Contact No.</Label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          value={clientData.shippingContactNo}
                          onChange={(e) =>
                            handleFieldChange(
                              "shippingContactNo",
                              e.target.value
                            )
                          }
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Email Address</Label>
                      <div className="relative">
                        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          type="email"
                          value={clientData.shippingEmail}
                          onChange={(e) =>
                            handleFieldChange("shippingEmail", e.target.value)
                          }
                          placeholder="Email"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Alternate Contact No.</Label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          value={clientData.shippingAlternateContactNo}
                          onChange={(e) =>
                            handleFieldChange(
                              "shippingAlternateContactNo",
                              e.target.value
                            )
                          }
                          placeholder="Phone"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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
