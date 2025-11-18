import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Client } from "@/lib/types";
import { ClientFormData } from "@/components/molecules/ClientsDialog/ClientsDialog";

interface ClientsState {
  clients: Client[];
}

const initialState: ClientsState = {
  clients: [],
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    addClient: (state, action: PayloadAction<ClientFormData>) => {
      const newClient: Client = {
        ...action.payload,
        id: `client-${Date.now()}`,
        balance: 0,
      };
      state.clients.push(newClient);
    },
    updateClient: (
      state,
      action: PayloadAction<{ id: string; data: ClientFormData }>
    ) => {
      const index = state.clients.findIndex(
        (client) => client.id === action.payload.id
      );
      if (index !== -1) {
        state.clients[index] = {
          ...state.clients[index],
          ...action.payload.data,
        };
      }
    },
    deleteClient: (state, action: PayloadAction<string>) => {
      state.clients = state.clients.filter(
        (client) => client.id !== action.payload
      );
    },
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },
    updateClientBalance: (
      state,
      action: PayloadAction<{ id: string; balance: number }>
    ) => {
      const index = state.clients.findIndex(
        (client) => client.id === action.payload.id
      );
      if (index !== -1) {
        state.clients[index].balance = action.payload.balance;
      }
    },
  },
});

export const {
  addClient,
  updateClient,
  deleteClient,
  setClients,
  updateClientBalance,
} = clientsSlice.actions;
export default clientsSlice.reducer;

