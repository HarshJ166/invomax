"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/molecules/DataTable/DataTable";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import { useAppDispatch } from "@/store/hooks";
import { fetchCompanies } from "@/store/thunks/companiesThunks";
import { fetchClients } from "@/store/thunks/clientsThunks";
import { fetchArchives, restoreArchiveThunk } from "@/store/thunks/archivesThunks";
import { fetchDealerArchives, restoreDealerArchiveThunk } from "@/store/thunks/dealerArchivesThunks";
import { DealerPayment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RotateCcwIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Archive {
  id: string;
  originalId: string;
  companyId: string;
  clientId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  items: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string;
}

interface ArchiveWithDetails extends Archive {
  companyName: string;
  clientName: string;
}

interface DealerArchive extends DealerPayment {
  originalId: string;
  archivedAt: string;
}

interface DealerArchiveWithDetails extends DealerArchive {
  companyName: string;
  clientName: string;
}

export default function RecycleBinPage() {
  const dispatch = useAppDispatch();
  const [archivesWithDetails, setArchivesWithDetails] = React.useState<ArchiveWithDetails[]>([]);
  const [dealerArchivesWithDetails, setDealerArchivesWithDetails] = React.useState<DealerArchiveWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"invoices" | "payments">("invoices");

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [archivesResult, dealerArchivesResult, companiesResult, clientsResult] = await Promise.all([
        dispatch(fetchArchives()),
        dispatch(fetchDealerArchives()),
        dispatch(fetchCompanies()),
        dispatch(fetchClients()),
      ]);

      if (
        fetchArchives.fulfilled.match(archivesResult) &&
        fetchDealerArchives.fulfilled.match(dealerArchivesResult) &&
        fetchCompanies.fulfilled.match(companiesResult) &&
        fetchClients.fulfilled.match(clientsResult)
      ) {
        const archivesList = archivesResult.payload as Archive[];
        const dealerArchivesList = dealerArchivesResult.payload as DealerArchive[];
        const companiesList = companiesResult.payload;
        const clientsList = clientsResult.payload;

        const archivesWithDetailsList: ArchiveWithDetails[] = archivesList.map(
          (archive) => {
            const company = companiesList.find((c) => c.id === archive.companyId);
            const client = clientsList.find((c) => c.id === archive.clientId);

            return {
              ...archive,
              companyName: company?.companyName || "Unknown Company",
              clientName:
                client?.customerType === "business"
                  ? client.companyName || `${client?.firstName} ${client?.lastName}`
                  : `${client?.firstName || ""} ${client?.lastName || ""}`.trim() ||
                    "Unknown Client",
            };
          }
        );

        const dealerArchivesWithDetailsList: DealerArchiveWithDetails[] = dealerArchivesList.map(
          (archive) => {
            const company = companiesList.find((c) => c.id === archive.companyId);
            const client = clientsList.find((c) => c.id === archive.clientId);

            return {
              ...archive,
              companyName: company?.companyName || "Unknown Company",
              clientName:
                client?.customerType === "business"
                  ? client.companyName || `${client?.firstName} ${client?.lastName}`
                  : `${client?.salutation ? client.salutation + ". " : ""}${client?.firstName || ""} ${client?.lastName || ""}`.trim() ||
                    "Unknown Client",
            };
          }
        );

        setArchivesWithDetails(archivesWithDetailsList);
        setDealerArchivesWithDetails(dealerArchivesWithDetailsList);
      }
    } catch (error) {
      console.error("Error loading archives:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRestoreArchive = async (archive: ArchiveWithDetails) => {
    if (!confirm(`Are you sure you want to restore invoice ${archive.invoiceNumber}?`)) {
      return;
    }

    try {
      const result = await dispatch(restoreArchiveThunk({ archiveId: archive.id }));
      if (restoreArchiveThunk.fulfilled.match(result)) {
        await loadData();
        alert("Invoice restored successfully!");
      } else {
        alert("Failed to restore invoice. Please try again.");
      }
    } catch (error) {
      console.error("Error restoring archive:", error);
      alert("Failed to restore invoice. Please try again.");
    }
  };

  const handleRestoreDealerArchive = async (archive: DealerArchiveWithDetails) => {
    if (!confirm(`Are you sure you want to restore payment ${archive.billNumber}?`)) {
      return;
    }

    try {
      const result = await dispatch(restoreDealerArchiveThunk({ archiveId: archive.id }));
      if (restoreDealerArchiveThunk.fulfilled.match(result)) {
        await loadData();
        alert("Payment restored successfully!");
      } else {
        alert("Failed to restore payment. Please try again.");
      }
    } catch (error) {
      console.error("Error restoring dealer archive:", error);
      alert("Failed to restore payment. Please try again.");
    }
  };

  const columns: Column<ArchiveWithDetails>[] = [
    {
      header: "Company Name",
      accessor: "companyName",
    },
    {
      header: "Client Name",
      accessor: "clientName",
    },
    {
      header: "Invoice Number",
      accessor: "invoiceNumber",
    },
    {
      header: "Invoice Date",
      accessor: (row) => {
        const date = new Date(row.invoiceDate);
        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      header: "Subtotal",
      accessor: (row) => {
        return `₹${row.subtotal.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    },
    {
      header: "Total",
      accessor: (row) => {
        return `₹${row.totalAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    },
    {
      header: "Deleted On",
      accessor: (row) => {
        const date = new Date(row.archivedAt);
        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      header: "Actions",
      accessor: (row) => {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRestoreArchive(row)}
              >
                <RotateCcwIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restore Invoice</TooltipContent>
          </Tooltip>
        );
      },
    },
  ];

  const dealerColumns: Column<DealerArchiveWithDetails>[] = [
    {
      header: "Company Name",
      accessor: "companyName",
    },
    {
      header: "Client Name",
      accessor: "clientName",
    },
    {
      header: "Bill Number",
      accessor: "billNumber",
    },
    {
      header: "Bill Date",
      accessor: (row) => {
        const date = new Date(row.billDate);
        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      header: "Bill Amount",
      accessor: (row) => {
        return `₹${row.billAmountTotal.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
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
      header: "Balance Amount",
      accessor: (row) => {
        return `₹${row.balanceAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    },
    {
      header: "Deleted On",
      accessor: (row) => {
        const date = new Date(row.archivedAt);
        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      header: "Actions",
      accessor: (row) => {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRestoreDealerArchive(row)}
              >
                <RotateCcwIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restore Payment</TooltipContent>
          </Tooltip>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Recycle Bin
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading archived items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Recycle Bin
          </h1>
          <p className="text-muted-foreground mt-2">
            View and restore deleted invoices and payments
          </p>
        </div>
        <RefreshButton onRefresh={loadData} />
      </div>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "invoices" | "payments")}>
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Dealer Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="mt-4">
          <DataTable
            data={archivesWithDetails}
            columns={columns}
            getRowId={(row) => row.id}
            showSerialNumber={true}
            emptyTitle="No archived invoices"
            emptyDescription="Deleted invoices will appear here. You can restore them at any time."
          />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <DataTable
            data={dealerArchivesWithDetails}
            columns={dealerColumns}
            getRowId={(row) => row.id}
            showSerialNumber={true}
            emptyTitle="No archived payments"
            emptyDescription="Deleted dealer payments will appear here. You can restore them at any time."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

