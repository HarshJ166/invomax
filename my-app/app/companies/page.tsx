"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/molecules/DataTable/DataTable";
import {
  CompaniesDialog,
  CompanyFormData,
} from "@/components/molecules/CompaniesDialog/CompaniesDialog";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Company } from "@/lib/types";
import {
  fetchCompanies,
  fetchCompaniesPaginated,
  createCompanyThunk,
  updateCompanyThunk,
  deleteCompanyThunk,
} from "@/store/thunks/companiesThunks";
import { useCrudPage } from "@/hooks/use-crud-page";

const initialCompanyData: CompanyFormData = {
  companyName: "",
  proprietor: "",
  address: "",
  email: "",
  phoneNumber: "",
  state: "",
  city: "",
  gstNumber: "",
  invoiceNumberInitial: "",
  logo: null,
  logoPreview: "",
  signature: null,
  signaturePreview: "",
  accountNumber: "",
  bankName: "",
  ifscCode: "",
  branch: "",
};

interface CompanyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
}

function CompanyDetailsDialog({
  open,
  onOpenChange,
  company,
}: CompanyDetailsDialogProps) {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[85%] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Company Details</DialogTitle>
          <DialogDescription>
            Complete information about the company.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Company Name
                    </p>
                    <p className="font-medium">{company.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Proprietor</p>
                    <p className="font-medium">{company.proprietor}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{company.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium">{company.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{company.city}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{company.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{company.phoneNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">GST Number</p>
                    <p className="font-medium">{company.gstNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Invoice Number Initial
                    </p>
                    <p className="font-medium">
                      {company.invoiceNumberInitial}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">Bank Details</h3>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Account Number
                    </p>
                    <p className="font-medium">{company.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-medium">{company.bankName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">IFSC Code</p>
                    <p className="font-medium">{company.ifscCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Branch</p>
                    <p className="font-medium">{company.branch}</p>
                  </div>
                </div>
              </div>
            </div>

            {(company.logoPreview || company.signaturePreview) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {company.logoPreview && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Company Logo
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={company.logoPreview}
                          alt="Company Logo"
                          className="max-h-32 object-contain border rounded p-2"
                        />
                      </div>
                    )}
                    {company.signaturePreview && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Signature
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={company.signaturePreview}
                          alt="Signature"
                          className="max-h-32 object-contain border rounded p-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CompaniesPage() {
  const companies = useAppSelector((state) => state.companies.companies);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const pageSize = 10;
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const loadPage = async () => {
      const offset = (currentPage - 1) * pageSize;
      const result = await dispatch(
        fetchCompaniesPaginated({ limit: pageSize, offset })
      );
      if (fetchCompaniesPaginated.fulfilled.match(result)) {
        setTotal(result.payload.total);
      }
    };
    loadPage();
  }, [currentPage, dispatch]);
  
  const {
    dialogOpen,
    detailsDialogOpen,
    formData: companyData,
    setFormData: setCompanyData,
    selectedEntity: selectedCompany,
    handleRefresh: originalHandleRefresh,
    handleCreate,
    handleEdit,
    handleDelete,
    handleInfo,
    handleSubmit,
    handleDialogClose,
    dialogTitle,
    submitLabel,
    setDetailsDialogOpen,
  } = useCrudPage<Company, CompanyFormData>({
    initialFormData: initialCompanyData,
    thunks: {
      fetch: fetchCompanies,
      create: createCompanyThunk,
      update: updateCompanyThunk,
      delete: deleteCompanyThunk,
    },
    createPayloadKey: "company",
    getEntityName: (company) => company.companyName,
  });

  const handleRefresh = () => {
    setCurrentPage(1);
    originalHandleRefresh();
  };

  const columns: Column<Company>[] = [
    {
      header: "Company Name",
      accessor: "companyName",
    },
    {
      header: "GST Number",
      accessor: "gstNumber",
    },
    {
      header: "Invoice Number Identifier",
      accessor: "invoiceNumberInitial",
    },
    {
      header: "Company Proprietor",
      accessor: "proprietor",
    },
    {
      header: "Revenue Total",
      accessor: (row) => {
        return `₹${row.revenueTotal.toLocaleString()}`;
      },
    },
    {
      header: "Company Debt",
      accessor: (row) => {
        return `₹${row.debt.toLocaleString()}`;
      },
    },
    {
      header: "Invoices Generated",
      accessor: (row) => {
        return row.invoiceCount.toString();
      },
    },
  ];

  const handleEditWrapper = (row: Record<string, unknown>) => {
    handleEdit(row as unknown as Company);
  };

  const handleDeleteWrapper = async (row: Record<string, unknown>) => {
    await handleDelete(row as unknown as Company);
  };

  const handleInfoWrapper = (row: Record<string, unknown>) => {
    handleInfo(row as unknown as Company);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Companies
        </h1>
        <RefreshButton onRefresh={handleRefresh} />
      </div>
      <DataTable
        data={companies as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        onCreate={handleCreate}
        onEdit={handleEditWrapper}
        onDelete={handleDeleteWrapper}
        onInfo={handleInfoWrapper}
        getRowId={(row) => (row as unknown as Company).id}
        createButtonLabel="Add Company"
        emptyTitle="No companies found"
        emptyDescription="Get started by adding your first company."
        pagination={{
          enabled: true,
          pageSize,
          currentPage,
          total,
          onPageChange: setCurrentPage,
        }}
      />
      <CompaniesDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        companyData={companyData}
        onCompanyDataChange={setCompanyData}
        onSubmit={handleSubmit}
        title={`${dialogTitle} Company`}
        submitLabel={submitLabel}
      />
      <CompanyDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        company={selectedCompany}
      />
    </div>
  );
}
