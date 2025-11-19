"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/molecules/DataTable/DataTable";
import {
  ItemDialog,
  ItemFormData,
} from "@/components/molecules/ItemDialog/ItemDialog";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Item } from "@/lib/types";
import {
  fetchItems,
  fetchItemsPaginated,
  createItemThunk,
  updateItemThunk,
  deleteItemThunk,
} from "@/store/thunks/itemsThunks";
import { AsyncThunk } from "@reduxjs/toolkit";
import { useCrudPage } from "@/hooks/use-crud-page";

const initialItemData: ItemFormData = {
  itemName: "",
  itemDescription: "",
  hsnCode: "",
  qtyAvailable: "",
  rate: "",
  unit: "",
};

export default function ItemsPage() {
  const items = useAppSelector((state) => state.items.items);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const pageSize = 10;
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const loadPage = async () => {
      const offset = (currentPage - 1) * pageSize;
      const result = await dispatch(
        fetchItemsPaginated({ limit: pageSize, offset })
      );
      if (fetchItemsPaginated.fulfilled.match(result)) {
        setTotal(result.payload.total);
      }
    };
    loadPage();
  }, [currentPage, dispatch]);
  
  const {
    dialogOpen,
    formData: itemData,
    setFormData: setItemData,
    handleRefresh: originalHandleRefresh,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleDialogClose,
    dialogTitle,
    submitLabel,
  } = useCrudPage<Item, ItemFormData>({
    initialFormData: initialItemData,
    thunks: {
      fetch: fetchItems as AsyncThunk<Item[], unknown, Record<string, unknown>>,
      create: createItemThunk as AsyncThunk<Item, unknown, Record<string, unknown>>,
      update: updateItemThunk as AsyncThunk<unknown, unknown, Record<string, unknown>>,
      delete: deleteItemThunk as AsyncThunk<string, { id: string }, Record<string, unknown>>,
    },
    createPayloadKey: "item",
    getEntityName: (item) => item.itemName,
  });

  const handleRefresh = () => {
    setCurrentPage(1);
    originalHandleRefresh();
  };

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

  const handleEditWrapper = (row: Record<string, unknown>) => {
    handleEdit(row as unknown as Item);
  };

  const handleDeleteWrapper = async (row: Record<string, unknown>) => {
    await handleDelete(row as unknown as Item);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">Items</h1>
        <RefreshButton onRefresh={handleRefresh} />
      </div>
      <DataTable
        data={items as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        onCreate={handleCreate}
        onEdit={handleEditWrapper}
        onDelete={handleDeleteWrapper}
        getRowId={(row) => (row as unknown as Item).id}
        createButtonLabel="Add Item"
        emptyTitle="No items found"
        emptyDescription="Get started by adding your first item."
        pagination={{
          enabled: true,
          pageSize,
          currentPage,
          total,
          onPageChange: setCurrentPage,
        }}
      />
      <ItemDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        itemData={itemData}
        onItemDataChange={setItemData}
        onSubmit={handleSubmit}
        title={`${dialogTitle} Item`}
        submitLabel={submitLabel}
      />
    </div>
  );
}
