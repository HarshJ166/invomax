import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Item } from "@/lib/types";
import { ItemFormData } from "@/components/molecules/ItemDialog/ItemDialog";

interface ItemsState {
  items: Item[];
}

const initialState: ItemsState = {
  items: [],
};

const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<ItemFormData>) => {
      const newItem: Item = {
        ...action.payload,
        id: `item-${Date.now()}`,
      };
      state.items.push(newItem);
    },
    updateItem: (
      state,
      action: PayloadAction<{ id: string; data: ItemFormData }>
    ) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload.data,
        };
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addItem, updateItem, deleteItem, setItems } = itemsSlice.actions;
export default itemsSlice.reducer;

