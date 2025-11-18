"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/molecules/DataTable/DataTable";
import {
  ItemDialog,
  ItemFormData,
} from "@/components/molecules/ItemDialog/ItemDialog";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addItem, updateItem, deleteItem } from "@/store/slices/itemsSlice";
import { Item } from "@/lib/types";

const initialItemData: ItemFormData = {
  itemName: "",
  itemDescription: "",
  hsnCode: "",
  qtyAvailable: "",
  rate: "",
  unit: "",
};

export default function ItemsPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.items.items);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [itemData, setItemData] = React.useState<ItemFormData>(initialItemData);
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);

  const columns: Column<Item>[] = [
    {
      header: "Item Name",
      accessor: "itemName",
    },
    {
      header: "Item Description",
      accessor: (row) => {
        if (row.itemDescription && row.unit) {
          return `${row.itemDescription} (${row.unit})`;
        }
        if (row.itemDescription) {
          return row.itemDescription;
        }
        if (row.unit) {
          return `(${row.unit})`;
        }
        return "-";
      },
    },
    {
      header: "HSN Code",
      accessor: "hsnCode",
    },
    {
      header: "Rate",
      accessor: (row) => {
        return row.rate ? `₹${parseFloat(row.rate).toLocaleString()}` : "-";
      },
    },
    {
      header: "Qty Available",
      accessor: (row) => {
        return row.qtyAvailable
          ? `${parseFloat(row.qtyAvailable).toLocaleString()} ${row.unit || ""}`
          : "-";
      },
    },
  ];

  const handleCreate = () => {
    setItemData(initialItemData);
    setEditingItemId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: Record<string, unknown>) => {
    const item = row as Item;
    setItemData({
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      hsnCode: item.hsnCode,
      qtyAvailable: item.qtyAvailable,
      rate: item.rate,
      unit: item.unit,
    });
    setEditingItemId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = (row: Record<string, unknown>) => {
    const item = row as Item;
    if (confirm(`Are you sure you want to delete "${item.itemName}"?`)) {
      dispatch(deleteItem(item.id));
    }
  };

  const handleSubmit = (data: ItemFormData) => {
    if (editingItemId) {
      dispatch(updateItem({ id: editingItemId, data }));
    } else {
      dispatch(addItem(data));
    }
    setDialogOpen(false);
    setItemData(initialItemData);
    setEditingItemId(null);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setItemData(initialItemData);
      setEditingItemId(null);
    }
    setDialogOpen(open);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white">Items</h1>
      </div>
      <DataTable
        data={items}
        columns={columns}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getRowId={(row) => (row as Item).id}
        createButtonLabel="Add Item"
        emptyTitle="No items found"
        emptyDescription="Get started by adding your first item."
      />
      <ItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        itemData={itemData}
        onItemDataChange={setItemData}
        onSubmit={handleSubmit}
        title={editingItemId ? "Edit Item" : "Add Item"}
        submitLabel={editingItemId ? "Update" : "Save"}
      />
    </div>
  );
}
