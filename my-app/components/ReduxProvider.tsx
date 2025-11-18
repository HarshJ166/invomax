"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { loadPersistedData } from "@/store/middleware/persistence";
import { setCompanies } from "@/store/slices/companiesSlice";
import { setClients } from "@/store/slices/clientsSlice";
import { setItems } from "@/store/slices/itemsSlice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadPersistedData();
        store.dispatch(setCompanies(data.companies));
        store.dispatch(setClients(data.clients));
        store.dispatch(setItems(data.items));
      } catch (error) {
        console.error("Failed to load persisted data:", error);
      }
    };

    loadData();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

