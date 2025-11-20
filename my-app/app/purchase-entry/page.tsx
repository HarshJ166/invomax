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
import { fetchItems } from "@/store/thunks/itemsThunks";
import { fetchClients } from "@/store/thunks/clientsThunks";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const initialPurchaseData: PurchaseFormData = {
  itemId: "",
  clientId: "",
  quantity: "",
  rate: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
};

export default function PurchaseEntryPage() {
  const purchases = useAppSelector((state) => state.purchases.purchases);
  const items = useAppSelector((state) => state.items.items);
  const clients = useAppSelector((state) => state.clients.clients);
  const dispatch = useAppDispatch();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [purchaseData, setPurchaseData] = React.useState<PurchaseFormData>(initialPurchaseData);

  const loadData = React.useCallback(async () => {
    await Promise.all([
      dispatch(fetchPurchases()),
      dispatch(fetchItems()),
      dispatch(fetchClients()),
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
      purchase: {
        itemId: data.itemId,
        clientId: data.clientId,
        quantity: parseFloat(data.quantity),
        rate: parseFloat(data.rate),
        amount: parseFloat(data.amount),
        date: data.date,
      }
    }));

    if (createPurchaseThunk.fulfilled.match(result)) {
      setDialogOpen(false);
      setPurchaseData(initialPurchaseData);
      // Refresh items to show updated quantity
      dispatch(fetchItems());
    }
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
        createButtonLabel="New Purchase"
        emptyTitle="No purchases found"
        emptyDescription="Get started by adding your first purchase."
      />
      <PurchaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        purchaseData={purchaseData}
        onPurchaseDataChange={setPurchaseData}
        onSubmit={handleSubmit}
        items={items}
        clients={clients}
      />
    </div>
  );
}

