import { createAsyncThunk } from "@reduxjs/toolkit";
import { dbService } from "@/lib/db-service";
import { Purchase } from "@/lib/types";
import {
  setPurchases,
  addPurchase,
  removePurchase,
} from "@/store/slices/purchasesSlice";

export const fetchPurchases = createAsyncThunk(
  "purchases/fetchPurchases",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const purchases = await dbService.purchases.getAll();
      dispatch(setPurchases(purchases));
      return purchases;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch purchases";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createPurchaseThunk = createAsyncThunk(
  "purchases/createPurchase",
  async (
    payload: { purchase: Partial<Purchase> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const { purchase } = payload;
      const newPurchase = {
        ...purchase,
        id: purchase.id || `purchase-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Purchase;

      const result = await dbService.purchases.create(newPurchase);

      if (!result.success) {
        return rejectWithValue("Failed to create purchase in database");
      }

      dispatch(addPurchase(newPurchase));
      return newPurchase;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create purchase";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deletePurchaseThunk = createAsyncThunk(
  "purchases/deletePurchase",
  async (payload: { id: string }, { dispatch, rejectWithValue }) => {
    try {
      const result = await dbService.purchases.delete(payload.id);

      if (!result.success) {
        return rejectWithValue("Failed to delete purchase from database");
      }

      dispatch(removePurchase(payload.id));
      return payload.id;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete purchase";
      return rejectWithValue(errorMessage);
    }
  }
);

