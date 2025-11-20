import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Purchase } from "@/lib/types";

interface PurchasesState {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
}

const initialState: PurchasesState = {
  purchases: [],
  loading: false,
  error: null,
};

export const purchasesSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {
    setPurchases: (state, action: PayloadAction<Purchase[]>) => {
      state.purchases = action.payload;
    },
    addPurchase: (state, action: PayloadAction<Purchase>) => {
      state.purchases.push(action.payload);
    },
    removePurchase: (state, action: PayloadAction<string>) => {
      state.purchases = state.purchases.filter(
        (purchase) => purchase.id !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPurchases,
  addPurchase,
  removePurchase,
  setLoading,
  setError,
} = purchasesSlice.actions;

export default purchasesSlice.reducer;

