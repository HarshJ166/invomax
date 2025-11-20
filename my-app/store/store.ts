import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "./slices/companiesSlice";
import itemsReducer from "./slices/itemsSlice";
import clientsReducer from "./slices/clientsSlice";
import dealersReducer from "./slices/dealersSlice";
import purchasesReducer from "./slices/purchasesSlice";
import { persistenceMiddleware } from "./middleware/persistence";

export const store = configureStore({
  reducer: {
    companies: companiesReducer,
    items: itemsReducer,
    clients: clientsReducer,
    dealers: dealersReducer,
    purchases: purchasesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
});

export type { RootState, AppDispatch } from "./types";
