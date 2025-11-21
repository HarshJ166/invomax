"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/molecules/DataTable/DataTable";
import {
  PurchaseDialog,
  PurchaseFormData,
} from "@/components/molecules/PurchaseDialog/PurchaseDialog";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Purchase, Item, Client } from "@/lib/types";
import {
  fetchPurchases,
  createPurchaseThunk,
  deletePurchaseThunk,
} from "@/store/thunks/purchasesThunks";
import { fetchItems, createItemThunk } from "@/store/thunks/itemsThunks";
import { fetchClients } from "@/store/thunks/clientsThunks";
import { fetchCompanies } from "@/store/thunks/companiesThunks";
import { ItemFormData } from "@/components/molecules/ItemDialog/ItemDialog";

const initialPurchaseData: PurchaseFormData = {
  companyId: "",
  clientId: "",
  invoiceNumber: "",
  date: new Date().toISOString().split("T")[0],
  items: [],
};

export default function PurchaseEntryPage() {
  const purchases = useAppSelector((state) => state.purchases.purchases);
  const items = useAppSelector((state) => state.items.items);
  const clients = useAppSelector((state) => state.clients.clients);
  const companies = useAppSelector((state) => state.companies.companies);
  const dispatch = useAppDispatch();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [purchaseData, setPurchaseData] = React.useState<PurchaseFormData>(initialPurchaseData);

  const loadData = React.useCallback(async () => {
    await Promise.all([
      dispatch(fetchPurchases()),
      dispatch(fetchItems()),
      dispatch(fetchClients()),
      dispatch(fetchCompanies()),
    ]);
  }, [dispatch]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setPurchaseData(initialPurchaseData);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: PurchaseFormData) => {
    const result = await dispatch(createPurchaseThunk({
      purchase: data as any // Backend handles the structure
    }));

    if (createPurchaseThunk.fulfilled.match(result)) {
      setDialogOpen(false);
      setPurchaseData(initialPurchaseData);
      // Refresh items to show updated quantity
      dispatch(fetchItems());
    }
  };

  const handleAddItem = async (data: ItemFormData) => {
    await dispatch(createItemThunk({ item: data }));
    await dispatch(fetchItems());
  };

  const handleDelete = async (purchase: Purchase) => {
    if (confirm("Are you sure you want to delete this purchase?")) {
      await dispatch(deletePurchaseThunk({ id: purchase.id }));
    }
  };

  const columns: Column<Purchase>[] = [
    {
      header: "Date",
      accessor: "date",
    },
    {
      header: "Invoice No.",
      accessor: (row) => row.invoiceNumber || "-",
    },
    {
      header: "Item Name",
      accessor: (row) => {
        const item = items.find((i) => i.id === row.itemId);
        return item ? item.itemName : "-";
      },
    },
    {
      header: "Purchased From",
      accessor: (row) => {
        const client = clients.find((c) => c.id === row.clientId);
        if (!client) return "-";
        return client.customerType === "business"
          ? client.companyName || `${client.firstName} ${client.lastName}`
          : `${client.firstName} ${client.lastName}`;
      },
    },
    {
      header: "Quantity",
      accessor: (row) => row.quantity.toString(),
    },
    {
      header: "Rate",
      accessor: (row) => `₹${row.rate.toLocaleString()}`,
    },
    {
      header: "Amount",
      accessor: (row) => `₹${row.amount.toLocaleString()}`,
    },
  ];

  const handleDeleteWrapper = async (row: Record<string, unknown>) => {
      await handleDelete(row as unknown as Purchase);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Purchase Entry
        </h1>
        <RefreshButton onRefresh={loadData} />
      </div>
      <DataTable
        data={purchases as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        onCreate={handleCreate}
        onDelete={handleDeleteWrapper}
        getRowId={(row) => (row as unknown as Purchase).id}
        createButtonLabel="New Purchase Bill"
        emptyTitle="No purchases found"
        emptyDescription="Get started by adding your first purchase."
      />
      <PurchaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        purchaseData={purchaseData}
        onPurchaseDataChange={setPurchaseData}
        onSubmit={handleSubmit}
        onAddItem={handleAddItem}
        items={items}
        clients={clients}
        companies={companies}
      />
    </div>
  );
}

