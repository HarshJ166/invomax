import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DealerPayment } from "@/lib/types";

interface DealersState {
  dealers: DealerPayment[];
}

const initialState: DealersState = {
  dealers: [],
};

const dealersSlice = createSlice({
  name: "dealers",
  initialState,
  reducers: {
    setDealers: (state, action: PayloadAction<DealerPayment[]>) => {
      state.dealers = action.payload;
    },
    addDealer: (state, action: PayloadAction<DealerPayment>) => {
      state.dealers.push(action.payload);
    },
    updateDealer: (state, action: PayloadAction<DealerPayment>) => {
      const index = state.dealers.findIndex(
        (dealer) => dealer.id === action.payload.id
      );
      if (index !== -1) {
        state.dealers[index] = action.payload;
      }
    },
    deleteDealer: (state, action: PayloadAction<string>) => {
      state.dealers = state.dealers.filter(
        (dealer) => dealer.id !== action.payload
      );
    },
  },
});

export const {
  setDealers,
  addDealer,
  updateDealer,
  deleteDealer,
} = dealersSlice.actions;
export default dealersSlice.reducer;

