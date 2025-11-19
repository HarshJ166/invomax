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
  createCompanyThunk,
  updateCompanyThunk,
  deleteCompanyThunk,
} from "@/store/thunks/companiesThunks";

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [companyData, setCompanyData] =
    React.useState<CompanyFormData>(initialCompanyData);
  const [editingCompanyId, setEditingCompanyId] = React.useState<string | null>(
    null
  );
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(
    null
  );

  const handleRefresh = React.useCallback(async () => {
    await dispatch(fetchCompanies());
  }, [dispatch]);

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

  const handleCreate = () => {
    setCompanyData(initialCompanyData);
    setEditingCompanyId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: Record<string, unknown>) => {
    const company = row as Company;
    setCompanyData({
      companyName: company.companyName,
      proprietor: company.proprietor,
      address: company.address,
      email: company.email,
      phoneNumber: company.phoneNumber,
      state: company.state,
      city: company.city,
      gstNumber: company.gstNumber,
      invoiceNumberInitial: company.invoiceNumberInitial,
      logo: company.logo,
      logoPreview: company.logoPreview,
      signature: company.signature,
      signaturePreview: company.signaturePreview,
      accountNumber: company.accountNumber,
      bankName: company.bankName,
      ifscCode: company.ifscCode,
      branch: company.branch,
    });
    setEditingCompanyId(company.id);
    setDialogOpen(true);
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    const company = row as Company;
    if (confirm(`Are you sure you want to delete "${company.companyName}"?`)) {
      await dispatch(deleteCompanyThunk({ id: company.id }));
    }
  };

  const handleInfo = (row: Record<string, unknown>) => {
    const company = row as Company;
    setSelectedCompany(company);
    setDetailsDialogOpen(true);
  };

  const handleSubmit = async (data: CompanyFormData) => {
    try {
    if (editingCompanyId) {
        await dispatch(updateCompanyThunk({ id: editingCompanyId, data }));
    } else {
        await dispatch(createCompanyThunk({ company: data }));
    }
    setDialogOpen(false);
    setCompanyData(initialCompanyData);
    setEditingCompanyId(null);
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Failed to save company. Please try again.");
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setCompanyData(initialCompanyData);
      setEditingCompanyId(null);
    }
    setDialogOpen(open);
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
        data={companies}
        columns={columns}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onInfo={handleInfo}
        getRowId={(row) => (row as Company).id}
        createButtonLabel="Add Company"
        emptyTitle="No companies found"
        emptyDescription="Get started by adding your first company."
      />
      <CompaniesDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        companyData={companyData}
        onCompanyDataChange={setCompanyData}
        onSubmit={handleSubmit}
        title={editingCompanyId ? "Edit Company" : "Add Company"}
        submitLabel={editingCompanyId ? "Update" : "Save"}
      />
      <CompanyDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        company={selectedCompany}
      />
    </div>
  );
}
