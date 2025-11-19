import { createAsyncThunk } from "@reduxjs/toolkit";
import { dbService } from "@/lib/db-service";
import { Company } from "@/lib/types";
import { CompanyFormData } from "@/components/molecules/CompaniesDialog/CompaniesDialog";
import { addCompany, updateCompany, deleteCompany, setCompanies } from "../slices/companiesSlice";

interface CreateCompanyPayload {
  company: CompanyFormData;
}

interface UpdateCompanyPayload {
  id: string;
  data: CompanyFormData | Partial<Company>;
}

interface DeleteCompanyPayload {
  id: string;
}

export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const companies = await dbService.companies.getAll();
      const typedCompanies = companies as Company[];
      dispatch(setCompanies(typedCompanies));
      return typedCompanies;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch companies";
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCompanyThunk = createAsyncThunk(
  "companies/createCompany",
  async (payload: CreateCompanyPayload, { dispatch, rejectWithValue }) => {
    try {
      const newCompany: Company = {
        ...payload.company,
        id: `company-${Date.now()}`,
        revenueTotal: 0,
        debt: 0,
        invoiceCount: 0,
        logo: null,
        signature: null,
      };

      const result = await dbService.companies.create(newCompany);
      
      if (!result.success) {
        return rejectWithValue("Failed to create company in database");
      }

      dispatch(addCompany(payload.company));
      return newCompany;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create company";
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCompanyThunk = createAsyncThunk(
  "companies/updateCompany",
  async (payload: UpdateCompanyPayload, { dispatch, rejectWithValue, getState }) => {
    console.log("[updateCompanyThunk] Starting company update");
    console.log("[updateCompanyThunk] Payload:", {
      id: payload.id,
      data: payload.data,
    });

    try {
      const state = getState() as { companies: { companies: Company[] } };
      const existingCompany = state.companies.companies.find((c) => c.id === payload.id);
      console.log("[updateCompanyThunk] Existing company in state:", {
        found: !!existingCompany,
        companyId: existingCompany?.id,
        invoiceCount: existingCompany?.invoiceCount,
      });
      
      if (!existingCompany) {
        console.log("[updateCompanyThunk] Company not in state, fetching from DB...");
        const allCompanies = await dbService.companies.getAll();
        const company = (allCompanies as Company[]).find((c) => c.id === payload.id);
        if (!company) {
          console.error("[updateCompanyThunk] Company not found in DB");
          return rejectWithValue("Company not found");
        }
        
        const updatedData = { ...company, ...payload.data } as Company;
        console.log("[updateCompanyThunk] Merged company data:", {
          id: updatedData.id,
          invoiceCount: updatedData.invoiceCount,
        });

        console.log("[updateCompanyThunk] Calling dbService.companies.update...");
        const result = await dbService.companies.update(payload.id, updatedData);
        console.log("[updateCompanyThunk] Update result:", result);
        
        if (!result.success) {
          console.error("[updateCompanyThunk] Update failed");
          return rejectWithValue("Failed to update company in database");
        }

        console.log("[updateCompanyThunk] Dispatching updateCompany action...");
        dispatch(updateCompany({ id: payload.id, data: updatedData }));
        return { id: payload.id, data: updatedData };
      }
      
      const updatedData = { ...existingCompany, ...payload.data } as Company;
      console.log("[updateCompanyThunk] Merged company data:", {
        id: updatedData.id,
        invoiceCount: updatedData.invoiceCount,
      });

      console.log("[updateCompanyThunk] Calling dbService.companies.update...");
      const result = await dbService.companies.update(payload.id, updatedData);
      console.log("[updateCompanyThunk] Update result:", result);
      
      if (!result.success) {
        console.error("[updateCompanyThunk] Update failed");
        return rejectWithValue("Failed to update company in database");
      }

      console.log("[updateCompanyThunk] Dispatching updateCompany action...");
      dispatch(updateCompany({ id: payload.id, data: updatedData }));
      console.log("[updateCompanyThunk] Company update completed successfully");
      return { id: payload.id, data: updatedData };
    } catch (error) {
      console.error("[updateCompanyThunk] Exception caught:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update company";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteCompanyThunk = createAsyncThunk(
  "companies/deleteCompany",
  async (payload: DeleteCompanyPayload, { dispatch, rejectWithValue }) => {
    try {
      const result = await dbService.companies.delete(payload.id);
      
      if (!result.success) {
        return rejectWithValue("Failed to delete company from database");
      }

      dispatch(deleteCompany(payload.id));
      return payload.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete company";
      return rejectWithValue(errorMessage);
    }
  }
);

