import { createAsyncThunk } from "@reduxjs/toolkit";
import { dbService } from "@/lib/db-service";
import { Client } from "@/lib/types";
import { ClientFormData } from "@/components/molecules/ClientsDialog/ClientsDialog";
import { addClient, updateClient, deleteClient, setClients, updateClientBalance } from "../slices/clientsSlice";

interface CreateClientPayload {
  client: ClientFormData;
}

interface UpdateClientPayload {
  id: string;
  data: ClientFormData;
}

interface DeleteClientPayload {
  id: string;
}

interface UpdateClientBalancePayload {
  id: string;
  balance: number;
}

export const fetchClients = createAsyncThunk(
  "clients/fetchClients",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const clients = await dbService.clients.getAll();
      const typedClients = clients as Client[];
      dispatch(setClients(typedClients));
      return typedClients;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch clients";
      return rejectWithValue(errorMessage);
    }
  }
);

interface FetchClientsPaginatedPayload {
  limit?: number;
  offset?: number;
}

export const fetchClientsPaginated = createAsyncThunk(
  "clients/fetchClientsPaginated",
  async (payload: FetchClientsPaginatedPayload = { limit: 10, offset: 0 }, { dispatch, rejectWithValue }) => {
    try {
      const { limit = 10, offset = 0 } = payload;
      const result = await dbService.clients.getPaginated(limit, offset);
      const typedClients = result.data as Client[];
      dispatch(setClients(typedClients));
      return { data: typedClients, total: result.total };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch clients";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createClientThunk = createAsyncThunk(
  "clients/createClient",
  async (payload: CreateClientPayload, { dispatch, rejectWithValue }) => {
    try {
      const newClient: Client = {
        ...payload.client,
        id: `client-${Date.now()}`,
        balance: 0,
      };

      const result = await dbService.clients.create(newClient);
      
      if (!result.success) {
        return rejectWithValue("Failed to create client in database");
      }

      dispatch(addClient(payload.client));
      return newClient;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create client";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateClientThunk = createAsyncThunk(
  "clients/updateClient",
  async (payload: UpdateClientPayload, { dispatch, rejectWithValue }) => {
    try {
      const result = await dbService.clients.update(payload.id, payload.data);
      
      if (!result.success) {
        return rejectWithValue("Failed to update client in database");
      }

      dispatch(updateClient({ id: payload.id, data: payload.data }));
      return { id: payload.id, data: payload.data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update client";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteClientThunk = createAsyncThunk(
  "clients/deleteClient",
  async (payload: DeleteClientPayload, { dispatch, rejectWithValue }) => {
    try {
      const result = await dbService.clients.delete(payload.id);
      
      if (!result.success) {
        return rejectWithValue("Failed to delete client from database");
      }

      dispatch(deleteClient(payload.id));
      return payload.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete client";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateClientBalanceThunk = createAsyncThunk(
  "clients/updateClientBalance",
  async (payload: UpdateClientBalancePayload, { dispatch, rejectWithValue }) => {
    try {
      const clients = await dbService.clients.getAll();
      const typedClients = clients as Client[];
      const client = typedClients.find((c) => c.id === payload.id);
      
      if (!client) {
        return rejectWithValue("Client not found");
      }

      const updatedClient = { ...client, balance: payload.balance };
      const result = await dbService.clients.update(payload.id, updatedClient);
      
      if (!result.success) {
        return rejectWithValue("Failed to update client balance in database");
      }

      dispatch(updateClientBalance({ id: payload.id, balance: payload.balance }));
      return payload;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update client balance";
      return rejectWithValue(errorMessage);
    }
  }
);

