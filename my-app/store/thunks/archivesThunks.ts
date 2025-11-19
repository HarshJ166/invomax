import { createAsyncThunk } from "@reduxjs/toolkit";
import { dbService } from "@/lib/db-service";
import { Invoice } from "@/lib/types";

interface Archive extends Invoice {
  originalId: string;
  archivedAt: string;
}

interface RestoreArchivePayload {
  archiveId: string;
}

export const fetchArchives = createAsyncThunk(
  "archives/fetchArchives",
  async (_, { rejectWithValue }) => {
    try {
      const archives = await dbService.archives.getAll();
      const typedArchives = archives as Archive[];
      return typedArchives;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch archives";
      return rejectWithValue(errorMessage);
    }
  }
);

export const restoreArchiveThunk = createAsyncThunk(
  "archives/restoreArchive",
  async (payload: RestoreArchivePayload, { rejectWithValue }) => {
    try {
      const result = await dbService.archives.restore(payload.archiveId);
      
      if (!result.success) {
        return rejectWithValue(result.error || "Failed to restore archive");
      }

      return payload.archiveId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to restore archive";
      return rejectWithValue(errorMessage);
    }
  }
);

