"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/molecules/DataTable/DataTable";
import {
  ClientsDialog,
  ClientFormData,
} from "@/components/molecules/ClientsDialog/ClientsDialog";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/store/hooks";
import { Client } from "@/lib/types";
import {
  fetchClients,
  createClientThunk,
  updateClientThunk,
  deleteClientThunk,
} from "@/store/thunks/clientsThunks";
import { useCrudPage } from "@/hooks/use-crud-page";
import { formatStateName } from "@/lib/formatters";
import { AsyncThunk } from "@reduxjs/toolkit";

const initialClientData: ClientFormData = {
  customerType: "business",
  salutation: "mr",
  firstName: "",
  lastName: "",
  panNumber: "",
  companyName: "",
  currency: "",
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

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

function ClientDetailsDialog({
  open,
  onOpenChange,
  client,
}: ClientDetailsDialogProps) {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
          <DialogDescription>
            Complete information about the client.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Customer Type
                    </p>
                    <p className="font-medium capitalize">
                      {client.customerType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {client.salutation.charAt(0).toUpperCase() +
                        client.salutation.slice(1)}
                      . {client.firstName} {client.lastName}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">PAN Number</p>
                    <p className="font-medium">{client.panNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Company Name
                    </p>
                    <p className="font-medium">{client.companyName || "-"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Currency</p>
                    <p className="font-medium">{client.currency || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      GST Applicable
                    </p>
                    <p className="font-medium">
                      {client.gstApplicable ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
                {client.gstApplicable && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">GSTIN/UIN</p>
                      <p className="font-medium">{client.gstin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        State Code
                      </p>
                      <p className="font-medium">{client.stateCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">Addresses</h3>
              <Tabs defaultValue="billing">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="billing">Billing Address</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping Address</TabsTrigger>
                </TabsList>
                <TabsContent value="billing" className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="font-medium capitalize">
                        {client.billingCountry || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="font-medium">
                        {client.billingState
                          ? formatStateName(client.billingState)
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{client.billingCity || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Address Line 1
                    </p>
                    <p className="font-medium">
                      {client.billingAddressLine1 || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Address Line 2
                    </p>
                    <p className="font-medium">
                      {client.billingAddressLine2 || "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Contact No.
                      </p>
                      <p className="font-medium">
                        {client.billingContactNo || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">
                        {client.billingEmail || "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Alternate Contact No.
                    </p>
                    <p className="font-medium">
                      {client.billingAlternateContactNo || "-"}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="shipping" className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="font-medium capitalize">
                        {client.shippingCountry || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="font-medium">
                        {client.shippingState
                          ? formatStateName(client.shippingState)
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{client.shippingCity || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Address Line 1
                    </p>
                    <p className="font-medium">
                      {client.shippingAddressLine1 || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Address Line 2
                    </p>
                    <p className="font-medium">
                      {client.shippingAddressLine2 || "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Contact No.
                      </p>
                      <p className="font-medium">
                        {client.shippingContactNo || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">
                        {client.shippingEmail || "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Alternate Contact No.
                    </p>
                    <p className="font-medium">
                      {client.shippingAlternateContactNo || "-"}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientsPage() {
  const clients = useAppSelector((state) => state.clients.clients);

  const {
    dialogOpen,
    detailsDialogOpen,
    formData: clientData,
    setFormData: setClientData,
    selectedEntity: selectedClient,
    handleRefresh,
    handleCreate,
    handleEdit,
    handleDelete,
    handleInfo,
    handleSubmit,
    handleDialogClose,
    dialogTitle,
    submitLabel,
    setDetailsDialogOpen,
  } = useCrudPage<Client, ClientFormData>({
    initialFormData: initialClientData,
    thunks: {
      fetch: fetchClients,
      create: createClientThunk as unknown as AsyncThunk<
        Client,
        unknown,
        Record<string, unknown>
      >,
      update: updateClientThunk as unknown as AsyncThunk<
        unknown,
        unknown,
        Record<string, unknown>
      >,
      delete: deleteClientThunk,
    },
    createPayloadKey: "client",
    getEntityName: (client) => `${client.firstName} ${client.lastName}`,
  });

  const columns: Column<Client>[] = [
    {
      header: "Client Name",
      accessor: (row) => {
        const salutation =
          row.salutation.charAt(0).toUpperCase() + row.salutation.slice(1);
        return `${salutation}. ${row.firstName} ${row.lastName}`;
      },
    },
    {
      header: "GST Number",
      accessor: (row) => row.gstin || "-",
    },
    {
      header: "Balance",
      accessor: (row) => {
        const balance = row.balance || 0;
        const isPositive = balance >= 0;
        return (
          <span
            className={
              isPositive
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {isPositive ? "+" : ""}₹{Math.abs(balance).toLocaleString()}
          </span>
        );
      },
    },
    {
      header: "Phone Number",
      accessor: (row) => row.billingContactNo || "-",
    },
  ];

  const handleEditWrapper = (row: Record<string, unknown>) => {
    handleEdit(row as unknown as Client);
  };

  const handleDeleteWrapper = async (row: Record<string, unknown>) => {
    await handleDelete(row as unknown as Client);
  };

  const handleInfoWrapper = (row: Record<string, unknown>) => {
    handleInfo(row as unknown as Client);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Clients
        </h1>
        <RefreshButton onRefresh={handleRefresh} />
      </div>
      <DataTable
        data={clients as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        onCreate={handleCreate}
        onEdit={handleEditWrapper}
        onDelete={handleDeleteWrapper}
        onInfo={handleInfoWrapper}
        getRowId={(row) => (row as unknown as Client).id}
        createButtonLabel="Add Client"
        emptyTitle="No clients found"
        emptyDescription="Get started by adding your first client."
      />
      <ClientsDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        clientData={clientData}
        onClientDataChange={setClientData}
        onSubmit={handleSubmit}
        title={`${dialogTitle} Client`}
        submitLabel={submitLabel}
      />
      <ClientDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        client={selectedClient}
      />
    </div>
  );
}
