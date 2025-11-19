"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/molecules/DataTable/DataTable";
import {
  DealerPaymentDialog,
  DealerPaymentFormData,
} from "@/components/molecules/DealerPaymentDialog/DealerPaymentDialog";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { DealerPayment, Company, Client } from "@/lib/types";
import {
  fetchDealersByCompanyId,
  fetchDealersByCompanyIdAndClientId,
  createDealerThunk,
  updateDealerThunk,
  deleteDealerThunk,
} from "@/store/thunks/dealersThunks";
import { fetchCompanies } from "@/store/thunks/companiesThunks";
import { fetchClients } from "@/store/thunks/clientsThunks";
import { useCrudPage } from "@/hooks/use-crud-page";

const initialDealerData: DealerPaymentFormData = {
  companyId: "",
  clientId: "",
  billNumber: "",
  billDate: "",
  billAmountTotal: 0,
  paymentMode: "cash",
  referenceNumber: "",
  paymentStatus: "unpaid",
  paidAmount: 0,
  description: "",
};

export default function DealerPaymentPage() {
  const dealers = useAppSelector((state) => state.dealers.dealers);
  const companies = useAppSelector((state) => state.companies.companies);
  const clients = useAppSelector((state) => state.clients.clients);
  const dispatch = useAppDispatch();

  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>("");
  const [selectedClientId, setSelectedClientId] = React.useState<string>("all");
  const [filteredDealers, setFilteredDealers] = React.useState<DealerPayment[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchClients());
  }, [dispatch]);

  React.useEffect(() => {
    if (selectedCompanyId) {
      if (selectedClientId && selectedClientId !== "all") {
        dispatch(
          fetchDealersByCompanyIdAndClientId({
            companyId: selectedCompanyId,
            clientId: selectedClientId,
          })
        );
      } else {
        dispatch(fetchDealersByCompanyId({ companyId: selectedCompanyId }));
      }
    } else {
      setFilteredDealers([]);
    }
  }, [selectedCompanyId, selectedClientId, dispatch]);

  React.useEffect(() => {
    setFilteredDealers(dealers);
  }, [dealers]);

  const {
    dialogOpen,
    formData: dealerData,
    setFormData: setDealerData,
    selectedEntity: selectedDealer,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit: originalHandleSubmit,
    handleDialogClose,
    dialogTitle,
    submitLabel,
  } = useCrudPage<DealerPayment, DealerPaymentFormData>({
    initialFormData: initialDealerData,
    thunks: {
      fetch: fetchDealersByCompanyId,
      create: createDealerThunk,
      update: updateDealerThunk,
      delete: deleteDealerThunk,
    },
    createPayloadKey: "dealer",
    updatePayloadKey: "dealer",
    getEntityName: (dealer) => dealer.billNumber,
  });

  const handleSubmit = async (data: DealerPaymentFormData) => {
    await originalHandleSubmit(data);
    handleRefresh();
  };

  const handleRefresh = () => {
    if (selectedCompanyId) {
      if (selectedClientId && selectedClientId !== "all") {
        dispatch(
          fetchDealersByCompanyIdAndClientId({
            companyId: selectedCompanyId,
            clientId: selectedClientId,
          })
        );
      } else {
        dispatch(fetchDealersByCompanyId({ companyId: selectedCompanyId }));
      }
    }
  };

  const handleCreateClick = () => {
    if (!selectedCompanyId) {
      return;
    }
    setDealerData({
      ...initialDealerData,
      companyId: selectedCompanyId,
    });
    handleCreate();
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedClientId("all");
    if (companyId) {
      dispatch(fetchDealersByCompanyId({ companyId }));
    } else {
      setFilteredDealers([]);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    if (selectedCompanyId) {
      if (clientId && clientId !== "all") {
        dispatch(
          fetchDealersByCompanyIdAndClientId({
            companyId: selectedCompanyId,
            clientId,
          })
        );
      } else {
        dispatch(fetchDealersByCompanyId({ companyId: selectedCompanyId }));
      }
    }
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const filteredClients = clients;

  const totalAmountToPay = React.useMemo(() => {
    return filteredDealers.reduce((sum, dealer) => {
      if (dealer.paymentStatus === "unpaid") {
        return sum + dealer.billAmountTotal;
      } else if (dealer.paymentStatus === "partial_paid") {
        return sum + dealer.balanceAmount;
      }
      return sum;
    }, 0);
  }, [filteredDealers]);

  const totalBillAmount = React.useMemo(() => {
    return filteredDealers.reduce((sum, dealer) => sum + dealer.billAmountTotal, 0);
  }, [filteredDealers]);

  const totalPaidAmount = React.useMemo(() => {
    return filteredDealers.reduce((sum, dealer) => sum + dealer.paidAmount, 0);
  }, [filteredDealers]);

  const getClientName = (clientId: string): string => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return "Unknown";
    if (client.customerType === "business") {
      return client.companyName || `${client.firstName} ${client.lastName}`;
    }
    return `${client.salutation ? client.salutation + ". " : ""}${client.firstName} ${client.lastName}`;
  };

  const getCompanyName = (companyId: string): string => {
    const company = companies.find((c) => c.id === companyId);
    return company?.companyName || "Unknown";
  };

  const columns: Column<DealerPayment>[] = [
    {
      header: "Bill Number",
      accessor: "billNumber",
    },
    {
      header: "Bill Date",
      accessor: (row) => {
        return new Date(row.billDate).toLocaleDateString();
      },
    },
    {
      header: "Client",
      accessor: (row) => getClientName(row.clientId),
    },
    {
      header: "Bill Amount",
      accessor: (row) => {
        return `₹${row.billAmountTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    },
    {
      header: "Payment Mode",
      accessor: (row) => {
        return row.paymentMode.toUpperCase();
      },
    },
    {
      header: "Reference Number",
      accessor: (row) => row.referenceNumber || "-",
    },
    {
      header: "Payment Status",
      accessor: (row) => {
        const statusMap = {
          paid: "Paid",
          unpaid: "Unpaid",
          partial_paid: "Partial Paid",
        };
        return statusMap[row.paymentStatus];
      },
    },
    {
      header: "Paid Amount",
      accessor: (row) => {
        return `₹${row.paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    },
    {
      header: "Balance Amount",
      accessor: (row) => {
        return `₹${row.balanceAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    },
  ];

  const handleEditWrapper = (row: Record<string, unknown>) => {
    const dealer = row as unknown as DealerPayment;
    setDealerData({
      companyId: dealer.companyId,
      clientId: dealer.clientId,
      billNumber: dealer.billNumber,
      billDate: dealer.billDate,
      billAmountTotal: dealer.billAmountTotal,
      paymentMode: dealer.paymentMode,
      referenceNumber: dealer.referenceNumber || "",
      paymentStatus: dealer.paymentStatus,
      paidAmount: dealer.paidAmount,
      description: dealer.description || "",
    });
    handleEdit(dealer);
  };

  const handleDeleteWrapper = async (row: Record<string, unknown>) => {
    await handleDelete(row as unknown as DealerPayment);
    handleRefresh();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Dealer Payment
        </h1>
        <RefreshButton onRefresh={handleRefresh} />
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Select Company</Label>
          <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Filter by Client (Optional)</Label>
          <Select
            value={selectedClientId}
            onValueChange={handleClientChange}
            disabled={!selectedCompanyId}
          >
            <SelectTrigger>
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All clients</SelectItem>
              {filteredClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.customerType === "business"
                    ? client.companyName || `${client.firstName} ${client.lastName}`
                    : `${client.salutation ? client.salutation + ". " : ""}${client.firstName} ${client.lastName}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCompany && (
          <div className="flex items-end">
            <div className="w-full p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Amount to Pay</p>
              <p className="text-2xl font-bold">
                ₹{totalAmountToPay.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Total Bill: ₹{totalBillAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>Total Paid: ₹{totalPaidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <DataTable
        data={filteredDealers as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        onCreate={selectedCompanyId ? handleCreateClick : undefined}
        onEdit={handleEditWrapper}
        onDelete={handleDeleteWrapper}
        getRowId={(row) => (row as unknown as DealerPayment).id}
        createButtonLabel="New Payment"
        emptyTitle={selectedCompanyId ? "No payments found" : "Select a company to view payments"}
        emptyDescription={
          selectedCompanyId
            ? "Get started by adding your first payment."
            : "Please select a company from the dropdown above."
        }
        pagination={{
          enabled: true,
          pageSize,
          currentPage,
          total: filteredDealers.length,
          onPageChange: setCurrentPage,
        }}
      />
      <DealerPaymentDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        dealerData={dealerData}
        onDealerDataChange={setDealerData}
        onSubmit={handleSubmit}
        title={`${dialogTitle} Payment`}
        submitLabel={submitLabel}
      />
    </div>
  );
}

