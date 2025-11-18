import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Company } from "@/lib/types";
import { CompanyFormData } from "@/components/molecules/CompaniesDialog/CompaniesDialog";

interface CompaniesState {
  companies: Company[];
}

const initialState: CompaniesState = {
  companies: [],
};

const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    addCompany: (state, action: PayloadAction<CompanyFormData>) => {
      const newCompany: Company = {
        ...action.payload,
        id: `company-${Date.now()}`,
        revenueTotal: 0,
        debt: 0,
        invoiceCount: 0,
      };
      state.companies.push(newCompany);
    },
    updateCompany: (
      state,
      action: PayloadAction<{ id: string; data: CompanyFormData }>
    ) => {
      const index = state.companies.findIndex(
        (company) => company.id === action.payload.id
      );
      if (index !== -1) {
        state.companies[index] = {
          ...state.companies[index],
          ...action.payload.data,
        };
      }
    },
    deleteCompany: (state, action: PayloadAction<string>) => {
      state.companies = state.companies.filter(
        (company) => company.id !== action.payload
      );
    },
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.companies = action.payload;
    },
  },
});

export const { addCompany, updateCompany, deleteCompany, setCompanies } =
  companiesSlice.actions;
export default companiesSlice.reducer;

