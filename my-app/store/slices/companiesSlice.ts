import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Company } from "@/lib/types";
import { CompanyFormData } from "@/components/molecules/CompaniesDialog/CompaniesDialog";

interface CompaniesState {
  companies: Company[];
}

const initialState: CompaniesState = {
  companies: [],
};

const stripFileObjects = (data: CompanyFormData): Omit<CompanyFormData, "logo" | "signature"> & {
  logoPreview: string;
  signaturePreview: string;
} => {
  const { logo, signature, ...rest } = data;
  return {
    ...rest,
    logoPreview: data.logoPreview || "",
    signaturePreview: data.signaturePreview || "",
  };
};

const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    addCompany: (state, action: PayloadAction<CompanyFormData>) => {
      const serializableData = stripFileObjects(action.payload);
      const newCompany: Company = {
        ...serializableData,
        logo: null,
        signature: null,
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
        const serializableData = stripFileObjects(action.payload.data);
        state.companies[index] = {
          ...state.companies[index],
          ...serializableData,
          logo: null,
          signature: null,
        };
      }
    },
    deleteCompany: (state, action: PayloadAction<string>) => {
      state.companies = state.companies.filter(
        (company) => company.id !== action.payload
      );
    },
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.companies = action.payload.map((company) => ({
        ...company,
        logo: null,
        signature: null,
      }));
    },
  },
});

export const { addCompany, updateCompany, deleteCompany, setCompanies } =
  companiesSlice.actions;
export default companiesSlice.reducer;

