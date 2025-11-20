import { createAsyncThunk } from "@reduxjs/toolkit";
import { dbService } from "@/lib/db-service";
import { Quotation } from "@/lib/types";

interface CreateQuotationPayload {
  quotation: Omit<Quotation, "createdAt" | "updatedAt"> | Quotation;
}

interface UpdateQuotationPayload {
  id: string;
  quotation: Partial<Omit<Quotation, "id" | "createdAt" | "updatedAt">>;
}

interface DeleteQuotationPayload {
  id: string;
}

interface GetQuotationByIdPayload {
  id: string;
}

interface GetQuotationByQuotationIdPayload {
  quotationId: string;
}

export const fetchQuotations = createAsyncThunk(
  "quotations/fetchQuotations",
  async (_, { rejectWithValue }) => {
    try {
      const quotations = await dbService.quotations.getAll();
      return quotations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch quotations";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createQuotationThunk = createAsyncThunk(
  "quotations/createQuotation",
  async (payload: CreateQuotationPayload, { rejectWithValue }) => {
    try {
      const quotationId = payload.quotation.id || `quotation-${Date.now()}`;
      const now = new Date().toISOString();
      const newQuotation: Quotation = {
        ...payload.quotation,
        id: quotationId,
        createdAt: "createdAt" in payload.quotation && payload.quotation.createdAt ? payload.quotation.createdAt : now,
        updatedAt: "updatedAt" in payload.quotation && payload.quotation.updatedAt ? payload.quotation.updatedAt : now,
      };

      const result = await dbService.quotations.create(newQuotation);
      
      if (!result.success) {
        const errorMessage = result.error || "Failed to create quotation in database";
        return rejectWithValue(errorMessage);
      }

      return newQuotation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create quotation";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateQuotationThunk = createAsyncThunk(
  "quotations/updateQuotation",
  async (payload: UpdateQuotationPayload, { rejectWithValue }) => {
    try {
      const result = await dbService.quotations.update(payload.id, payload.quotation);
      
      if (!result.success) {
        return rejectWithValue("Failed to update quotation in database");
      }

      return { id: payload.id, quotation: payload.quotation };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update quotation";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteQuotationThunk = createAsyncThunk(
  "quotations/deleteQuotation",
  async (payload: DeleteQuotationPayload, { rejectWithValue }) => {
    try {
      const result = await dbService.quotations.delete(payload.id);
      
      if (!result.success) {
        return rejectWithValue("Failed to delete quotation from database");
      }

      return payload.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete quotation";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getQuotationByIdThunk = createAsyncThunk(
  "quotations/getQuotationById",
  async (payload: GetQuotationByIdPayload, { rejectWithValue }) => {
    try {
      const result = await dbService.quotations.getById(payload.id);
      
      if (!result.success || !result.data) {
        return rejectWithValue("Quotation not found");
      }

      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get quotation";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getQuotationByQuotationIdThunk = createAsyncThunk(
  "quotations/getQuotationByQuotationId",
  async (payload: GetQuotationByQuotationIdPayload, { rejectWithValue }) => {
    try {
      const result = await dbService.quotations.getByQuotationId(payload.quotationId);
      
      if (!result.success) {
        return rejectWithValue("Failed to get quotation");
      }

      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get quotation";
      return rejectWithValue(errorMessage);
    }
  }
);

