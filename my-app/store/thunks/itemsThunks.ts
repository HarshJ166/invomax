import { createAsyncThunk } from "@reduxjs/toolkit";
import { dbService } from "@/lib/db-service";
import { Item } from "@/lib/types";
import { ItemFormData } from "@/components/molecules/ItemDialog/ItemDialog";
import { addItem, updateItem, deleteItem, setItems } from "../slices/itemsSlice";

interface CreateItemPayload {
  item: ItemFormData;
}

interface UpdateItemPayload {
  id: string;
  data: ItemFormData;
}

interface DeleteItemPayload {
  id: string;
}

export const fetchItems = createAsyncThunk(
  "items/fetchItems",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const items = await dbService.items.getAll();
      const typedItems = items as Item[];
      dispatch(setItems(typedItems));
      return typedItems;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch items";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createItemThunk = createAsyncThunk(
  "items/createItem",
  async (payload: CreateItemPayload, { dispatch, rejectWithValue }) => {
    try {
      const newItem: Item = {
        ...payload.item,
        id: `item-${Date.now()}`,
      };

      const result = await dbService.items.create(newItem);
      
      if (!result.success) {
        return rejectWithValue("Failed to create item in database");
      }

      dispatch(addItem(payload.item));
      return newItem;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create item";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateItemThunk = createAsyncThunk(
  "items/updateItem",
  async (payload: UpdateItemPayload, { dispatch, rejectWithValue }) => {
    try {
      const result = await dbService.items.update(payload.id, payload.data);
      
      if (!result.success) {
        return rejectWithValue("Failed to update item in database");
      }

      dispatch(updateItem({ id: payload.id, data: payload.data }));
      return { id: payload.id, data: payload.data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update item";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteItemThunk = createAsyncThunk(
  "items/deleteItem",
  async (payload: DeleteItemPayload, { dispatch, rejectWithValue }) => {
    try {
      const result = await dbService.items.delete(payload.id);
      
      if (!result.success) {
        return rejectWithValue("Failed to delete item from database");
      }

      dispatch(deleteItem(payload.id));
      return payload.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete item";
      return rejectWithValue(errorMessage);
    }
  }
);

