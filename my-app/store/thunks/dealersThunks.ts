import { createAsyncThunk } from "@reduxjs/toolkit";
import { dbService } from "@/lib/db-service";
import { DealerPayment } from "@/lib/types";
import { setDealers, addDealer, updateDealer, deleteDealer } from "../slices/dealersSlice";

interface CreateDealerPayload {
  dealer: Omit<DealerPayment, "id" | "createdAt" | "updatedAt" | "balanceAmount">;
}

interface UpdateDealerPayload {
  id: string;
  dealer: Partial<Omit<DealerPayment, "id" | "createdAt" | "updatedAt">>;
}

interface DeleteDealerPayload {
  id: string;
}

interface GetDealersByCompanyIdPayload {
  companyId: string;
}

interface GetDealersByCompanyIdAndClientIdPayload {
  companyId: string;
  clientId: string;
}

export const fetchDealers = createAsyncThunk(
  "dealers/fetchDealers",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const dealers = await dbService.dealers.getAll();
      const typedDealers = dealers as DealerPayment[];
      dispatch(setDealers(typedDealers));
      return typedDealers;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch dealers";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDealersByCompanyId = createAsyncThunk(
  "dealers/fetchDealersByCompanyId",
  async (payload: GetDealersByCompanyIdPayload, { dispatch, rejectWithValue }) => {
    try {
      const dealers = await dbService.dealers.getByCompanyId(payload.companyId);
      const typedDealers = dealers as DealerPayment[];
      dispatch(setDealers(typedDealers));
      return typedDealers;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch dealers";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDealersByCompanyIdAndClientId = createAsyncThunk(
  "dealers/fetchDealersByCompanyIdAndClientId",
  async (payload: GetDealersByCompanyIdAndClientIdPayload, { dispatch, rejectWithValue }) => {
    try {
      const dealers = await dbService.dealers.getByCompanyIdAndClientId(
        payload.companyId,
        payload.clientId
      );
      const typedDealers = dealers as DealerPayment[];
      dispatch(setDealers(typedDealers));
      return typedDealers;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch dealers";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createDealerThunk = createAsyncThunk(
  "dealers/createDealer",
  async (payload: CreateDealerPayload, { dispatch, rejectWithValue }) => {
    try {
      let balanceAmount = 0;
      if (payload.dealer.paymentStatus === "partial_paid") {
        balanceAmount = payload.dealer.billAmountTotal - (payload.dealer.paidAmount || 0);
      } else if (payload.dealer.paymentStatus === "unpaid") {
        balanceAmount = payload.dealer.billAmountTotal;
      }

      const newDealer: DealerPayment = {
        ...payload.dealer,
        id: `dealer-${Date.now()}`,
        balanceAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await dbService.dealers.create(newDealer);
      
      if (!result.success) {
        return rejectWithValue("Failed to create dealer payment in database");
      }

      dispatch(addDealer(newDealer));
      return newDealer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create dealer payment";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateDealerThunk = createAsyncThunk(
  "dealers/updateDealer",
  async (payload: UpdateDealerPayload, { dispatch, rejectWithValue }) => {
    try {
      const existingDealers = await dbService.dealers.getAll();
      const typedDealers = existingDealers as DealerPayment[];
      const existingDealer = typedDealers.find((d) => d.id === payload.id);
      
      if (!existingDealer) {
        return rejectWithValue("Dealer payment not found");
      }

      const billAmountTotal = payload.dealer.billAmountTotal ?? existingDealer.billAmountTotal;
      const paidAmount = payload.dealer.paidAmount ?? existingDealer.paidAmount;
      const paymentStatus = payload.dealer.paymentStatus ?? existingDealer.paymentStatus;

      let balanceAmount = 0;
      if (paymentStatus === "partial_paid") {
        balanceAmount = billAmountTotal - paidAmount;
      } else if (paymentStatus === "unpaid") {
        balanceAmount = billAmountTotal;
      }

      const updatedDealer: DealerPayment = {
        ...existingDealer,
        ...payload.dealer,
        balanceAmount,
        updatedAt: new Date().toISOString(),
      };

      const result = await dbService.dealers.update(payload.id, updatedDealer);
      
      if (!result.success) {
        return rejectWithValue("Failed to update dealer payment in database");
      }

      dispatch(updateDealer(updatedDealer));
      return updatedDealer;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update dealer payment";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteDealerThunk = createAsyncThunk(
  "dealers/deleteDealer",
  async (payload: DeleteDealerPayload, { dispatch, rejectWithValue }) => {
    try {
      const result = await dbService.dealers.archive(payload.id);
      
      if (!result.success) {
        return rejectWithValue(result.error || "Failed to archive dealer payment");
      }

      dispatch(deleteDealer(payload.id));
      return payload.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to archive dealer payment";
      return rejectWithValue(errorMessage);
    }
  }
);

