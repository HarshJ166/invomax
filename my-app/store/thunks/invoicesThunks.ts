import { createAsyncThunk } from "@reduxjs/toolkit";
import { dbService } from "@/lib/db-service";
import { Invoice } from "@/lib/types";

interface CreateInvoicePayload {
  invoice: Omit<Invoice, "createdAt" | "updatedAt"> | Invoice;
}

interface UpdateInvoicePayload {
  id: string;
  invoice: Partial<Omit<Invoice, "id" | "createdAt" | "updatedAt">>;
}

interface DeleteInvoicePayload {
  id: string;
}

interface GetInvoiceByIdPayload {
  id: string;
}

interface GetLastInvoiceByCompanyIdPayload {
  companyId: string;
}

export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async (_, { rejectWithValue }) => {
    console.log("[fetchInvoices] Starting to fetch invoices");
    try {
      const invoices = await dbService.invoices.getAll();
      const typedInvoices = invoices as Invoice[];
      console.log("[fetchInvoices] Fetched invoices:", {
        count: typedInvoices.length,
        invoiceIds: typedInvoices.map((inv) => inv.id),
        invoiceNumbers: typedInvoices.map((inv) => inv.invoiceNumber),
      });
      return typedInvoices;
    } catch (error) {
      console.error("[fetchInvoices] Error fetching invoices:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch invoices";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createInvoiceThunk = createAsyncThunk(
  "invoices/createInvoice",
  async (payload: CreateInvoicePayload, { rejectWithValue }) => {
    console.log("[createInvoiceThunk] Starting invoice creation");
    console.log("[createInvoiceThunk] Payload received:", {
      invoiceId: payload.invoice.id,
      companyId: payload.invoice.companyId,
      clientId: payload.invoice.clientId,
      invoiceNumber: payload.invoice.invoiceNumber,
      totalAmount: payload.invoice.totalAmount,
    });

    try {
      const invoiceId = payload.invoice.id || `invoice-${Date.now()}`;
      console.log("[createInvoiceThunk] Using invoice ID:", invoiceId);

      const now = new Date().toISOString();
      const newInvoice: Invoice = {
        ...payload.invoice,
        id: invoiceId,
        createdAt: "createdAt" in payload.invoice && payload.invoice.createdAt ? payload.invoice.createdAt : now,
        updatedAt: "updatedAt" in payload.invoice && payload.invoice.updatedAt ? payload.invoice.updatedAt : now,
      };

      console.log("[createInvoiceThunk] Prepared invoice object:", {
        id: newInvoice.id,
        companyId: newInvoice.companyId,
        clientId: newInvoice.clientId,
        invoiceNumber: newInvoice.invoiceNumber,
        createdAt: newInvoice.createdAt,
      });

      console.log("[createInvoiceThunk] Calling dbService.invoices.create...");
      const result = await dbService.invoices.create(newInvoice);
      console.log("[createInvoiceThunk] dbService result:", result);
      
      if (!result.success) {
        const errorMessage = result.error || "Failed to create invoice in database";
        console.error("[createInvoiceThunk] Creation failed:", errorMessage);
        return rejectWithValue(errorMessage);
      }

      console.log("[createInvoiceThunk] Invoice created successfully, returning:", {
        id: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
      });

      console.log("[createInvoiceThunk] Verifying invoice exists in DB...");
      const allInvoices = await dbService.invoices.getAll();
      const invoiceExists = (allInvoices as Invoice[]).some((inv) => inv.id === invoiceId);
      console.log("[createInvoiceThunk] Verification result:", {
        invoiceId,
        exists: invoiceExists,
        totalInvoices: allInvoices.length,
      });

      return newInvoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create invoice";
      console.error("[createInvoiceThunk] Exception caught:", error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateInvoiceThunk = createAsyncThunk(
  "invoices/updateInvoice",
  async (payload: UpdateInvoicePayload, { rejectWithValue }) => {
    try {
      const result = await dbService.invoices.update(payload.id, payload.invoice);
      
      if (!result.success) {
        return rejectWithValue("Failed to update invoice in database");
      }

      return { id: payload.id, invoice: payload.invoice };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update invoice";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteInvoiceThunk = createAsyncThunk(
  "invoices/deleteInvoice",
  async (payload: DeleteInvoicePayload, { rejectWithValue }) => {
    try {
      const result = await dbService.invoices.delete(payload.id);
      
      if (!result.success) {
        return rejectWithValue("Failed to delete invoice from database");
      }

      return payload.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete invoice";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getInvoiceByIdThunk = createAsyncThunk(
  "invoices/getInvoiceById",
  async (payload: GetInvoiceByIdPayload, { rejectWithValue }) => {
    try {
      const result = await dbService.invoices.getById(payload.id);
      
      if (!result.success || !result.data) {
        return rejectWithValue("Invoice not found");
      }

      return result.data as Invoice;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get invoice";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getLastInvoiceByCompanyIdThunk = createAsyncThunk(
  "invoices/getLastInvoiceByCompanyId",
  async (payload: GetLastInvoiceByCompanyIdPayload, { rejectWithValue }) => {
    try {
      const result = await dbService.invoices.getLastByCompanyId(payload.companyId);
      
      if (!result.success) {
        return rejectWithValue("Failed to get last invoice");
      }

      return result.data as Invoice | undefined;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get last invoice";
      return rejectWithValue(errorMessage);
    }
  }
);

interface ArchiveInvoicePayload {
  invoiceId: string;
}

export const archiveInvoiceThunk = createAsyncThunk(
  "invoices/archiveInvoice",
  async (payload: ArchiveInvoicePayload, { rejectWithValue }) => {
    try {
      const result = await dbService.invoices.archive(payload.invoiceId);
      
      if (!result.success) {
        return rejectWithValue(result.error || "Failed to archive invoice");
      }

      return payload.invoiceId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to archive invoice";
      return rejectWithValue(errorMessage);
    }
  }
);

