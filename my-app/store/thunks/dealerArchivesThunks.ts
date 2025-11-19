import { createAsyncThunk } from "@reduxjs/toolkit";
import { dbService } from "@/lib/db-service";
import { DealerPayment } from "@/lib/types";

interface DealerArchive extends DealerPayment {
  originalId: string;
  archivedAt: string;
}

interface RestoreDealerArchivePayload {
  archiveId: string;
}

export const fetchDealerArchives = createAsyncThunk(
  "dealerArchives/fetchDealerArchives",
  async (_, { rejectWithValue }) => {
    try {
      const archives = await dbService.dealerArchives.getAll();
      return archives as DealerArchive[];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch dealer archives";
      return rejectWithValue(errorMessage);
    }
  }
);

export const restoreDealerArchiveThunk = createAsyncThunk(
  "dealerArchives/restoreDealerArchive",
  async (payload: RestoreDealerArchivePayload, { rejectWithValue }) => {
    try {
      const result = await dbService.dealerArchives.restore(payload.archiveId);
      
      if (!result.success) {
        return rejectWithValue(result.error || "Failed to restore dealer payment");
      }

      return result.data as DealerPayment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to restore dealer payment";
      return rejectWithValue(errorMessage);
    }
  }
);

