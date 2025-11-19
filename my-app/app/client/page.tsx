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
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Client } from "@/lib/types";
import {
  fetchClients,
  createClientThunk,
  updateClientThunk,
  deleteClientThunk,
} from "@/store/thunks/clientsThunks";

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

  const formatStateName = (state: string) =>
    state
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

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
  const dispatch = useAppDispatch();
  const clients = useAppSelector((state) => state.clients.clients);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [clientData, setClientData] =
    React.useState<ClientFormData>(initialClientData);
  const [editingClientId, setEditingClientId] = React.useState<string | null>(
    null
  );
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null
  );

  const handleRefresh = React.useCallback(async () => {
    await dispatch(fetchClients());
  }, [dispatch]);

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

  const handleCreate = () => {
    setClientData(initialClientData);
    setEditingClientId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: Record<string, unknown>) => {
    const client = row as Client;
    setClientData({
      customerType: client.customerType,
      salutation: client.salutation,
      firstName: client.firstName,
      lastName: client.lastName,
      panNumber: client.panNumber,
      companyName: client.companyName,
      currency: client.currency,
      gstApplicable: client.gstApplicable,
      gstin: client.gstin,
      stateCode: client.stateCode,
      billingCountry: client.billingCountry,
      billingState: client.billingState,
      billingCity: client.billingCity,
      billingAddressLine1: client.billingAddressLine1,
      billingAddressLine2: client.billingAddressLine2,
      billingContactNo: client.billingContactNo,
      billingEmail: client.billingEmail,
      billingAlternateContactNo: client.billingAlternateContactNo,
      shippingCountry: client.shippingCountry,
      shippingState: client.shippingState,
      shippingCity: client.shippingCity,
      shippingAddressLine1: client.shippingAddressLine1,
      shippingAddressLine2: client.shippingAddressLine2,
      shippingContactNo: client.shippingContactNo,
      shippingEmail: client.shippingEmail,
      shippingAlternateContactNo: client.shippingAlternateContactNo,
    });
    setEditingClientId(client.id);
    setDialogOpen(true);
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    const client = row as Client;
    const clientName = `${client.firstName} ${client.lastName}`;
    if (confirm(`Are you sure you want to delete "${clientName}"?`)) {
      await dispatch(deleteClientThunk({ id: client.id }));
    }
  };

  const handleInfo = (row: Record<string, unknown>) => {
    const client = row as Client;
    setSelectedClient(client);
    setDetailsDialogOpen(true);
  };

  const handleSubmit = async (data: ClientFormData) => {
    try {
    if (editingClientId) {
        await dispatch(updateClientThunk({ id: editingClientId, data }));
    } else {
        await dispatch(createClientThunk({ client: data }));
    }
    setDialogOpen(false);
    setClientData(initialClientData);
    setEditingClientId(null);
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Failed to save client. Please try again.");
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setClientData(initialClientData);
      setEditingClientId(null);
    }
    setDialogOpen(open);
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
        data={clients}
        columns={columns}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onInfo={handleInfo}
        getRowId={(row) => (row as Client).id}
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
        title={editingClientId ? "Edit Client" : "Add Client"}
        submitLabel={editingClientId ? "Update" : "Save"}
      />
      <ClientDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        client={selectedClient}
      />
    </div>
  );
}
