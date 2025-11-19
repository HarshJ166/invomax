"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/molecules/DataTable/DataTable";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCompanies } from "@/store/thunks/companiesThunks";
import { fetchClients } from "@/store/thunks/clientsThunks";
import { fetchInvoices, updateInvoiceThunk } from "@/store/thunks/invoicesThunks";
import { Company, Client, Invoice } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DownloadIcon, EditIcon, TrashIcon } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import InvoicePDF from "@/components/pdf/InvoicePDF";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { archiveInvoiceThunk } from "@/store/thunks/invoicesThunks";
import { useRouter } from "next/navigation";

interface InvoiceWithDetails extends Invoice {
  companyName: string;
  clientName: string;
}

export default function InvoiceListPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const companies = useAppSelector((state) => state.companies.companies);
  const clients = useAppSelector((state) => state.clients.clients);
  const [invoicesWithDetails, setInvoicesWithDetails] = React.useState<InvoiceWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [invoicesResult, companiesResult, clientsResult] = await Promise.all([
        dispatch(fetchInvoices()),
        dispatch(fetchCompanies()),
        dispatch(fetchClients()),
      ]);

      if (
        fetchInvoices.fulfilled.match(invoicesResult) &&
        fetchCompanies.fulfilled.match(companiesResult) &&
        fetchClients.fulfilled.match(clientsResult)
      ) {
        const invoicesList = invoicesResult.payload;
        const companiesList = companiesResult.payload;
        const clientsList = clientsResult.payload;

        const invoicesWithDetailsList: InvoiceWithDetails[] = invoicesList.map(
        (invoice) => {
          const company = companiesList.find((c) => c.id === invoice.companyId);
          const client = clientsList.find((c) => c.id === invoice.clientId);

          return {
            ...invoice,
            companyName: company?.companyName || "Unknown Company",
            clientName:
              client?.customerType === "business"
                ? client.companyName || `${client?.firstName} ${client?.lastName}`
                : `${client?.firstName || ""} ${client?.lastName || ""}`.trim() ||
                  "Unknown Client",
          };
        }
      );

        setInvoicesWithDetails(invoicesWithDetailsList);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (
    invoiceId: string,
    newStatus: "paid" | "unpaid"
  ) => {
    try {
      const invoice = invoicesWithDetails.find((inv) => inv.id === invoiceId);
      if (!invoice) return;

      const statusToSave = newStatus === "paid" ? "paid" : "sent";

      const result = await dispatch(
        updateInvoiceThunk({
          id: invoiceId,
          invoice: {
        status: statusToSave,
          },
        })
      );

      if (updateInvoiceThunk.fulfilled.match(result)) {
        await loadData();
      } else {
        alert("Failed to update invoice status");
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
      alert("Failed to update invoice status");
    }
  };

  const getCurrentStatus = (status: string): "paid" | "unpaid" => {
    return status === "paid" ? "paid" : "unpaid";
  };

  const generatePDF = async (invoice: Invoice, company: Company, client: Client): Promise<Blob> => {
    const html = renderToStaticMarkup(
      <InvoicePDF invoice={invoice} company={company} client={client} />
    );

    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ html }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    return await response.blob();
  };

  const downloadPDF = async (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadInvoice = async (invoice: InvoiceWithDetails) => {
    try {
      const company = companies.find((c) => c.id === invoice.companyId);
      const client = clients.find((c) => c.id === invoice.clientId);

      if (!company || !client) {
        alert("Company or client information not found for this invoice.");
        return;
      }

      const blob = await generatePDF(invoice, company, client);
      await downloadPDF(blob, `invoice_${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleEditInvoice = (invoice: InvoiceWithDetails) => {
    router.push(`/invoice?edit=${invoice.id}`);
  };

  const handleDeleteInvoice = async (invoice: InvoiceWithDetails) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      return;
    }

    try {
      const result = await dispatch(archiveInvoiceThunk({ invoiceId: invoice.id }));
      if (archiveInvoiceThunk.fulfilled.match(result)) {
        await loadData();
        alert("Invoice deleted successfully.");
      } else {
        alert("Failed to delete invoice. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice. Please try again.");
    }
  };

  const columns: Column<InvoiceWithDetails>[] = [
    {
      header: "Company Name",
      accessor: "companyName",
    },
    {
      header: "Client Name",
      accessor: "clientName",
    },
    {
      header: "Invoice ID",
      accessor: "invoiceNumber",
    },
    {
      header: "Date of Invoice",
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
      header: "Status",
      accessor: (row) => {
        const currentStatus = getCurrentStatus(row.status);
        return (
          <Select
            value={currentStatus}
            onValueChange={(value) =>
              handleStatusChange(row.id, value as "paid" | "unpaid")
            }
          >
            <SelectTrigger
              className={`w-32 ${
                currentStatus === "paid"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-red-500 bg-red-50 text-red-700"
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">
                <span className="text-green-600 font-semibold">Paid</span>
              </SelectItem>
              <SelectItem value="unpaid">
                <span className="text-red-600 font-semibold">Unpaid</span>
              </SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      header: "Actions",
      accessor: (row) => {
        return (
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownloadInvoice(row)}
                >
                  <DownloadIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download PDF</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditInvoice(row)}
                >
                  <EditIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Invoice</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteInvoice(row)}
                >
                  <TrashIcon className="size-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Invoice</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Invoice List
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Invoice List
        </h1>
        <RefreshButton onRefresh={loadData} />
      </div>
      <DataTable
        data={invoicesWithDetails}
        columns={columns}
        getRowId={(row) => row.id}
        showSerialNumber={true}
        emptyTitle="No invoices found"
        emptyDescription="Get started by creating your first invoice."
      />
    </div>
  );
}

