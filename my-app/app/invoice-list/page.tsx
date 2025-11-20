"use client";

import * as React from "react";
import { DataTable, Column } from "@/components/molecules/DataTable/DataTable";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCompanies } from "@/store/thunks/companiesThunks";
import { fetchClients } from "@/store/thunks/clientsThunks";
import { fetchInvoices, updateInvoiceThunk } from "@/store/thunks/invoicesThunks";
import { fetchQuotations, deleteQuotationThunk } from "@/store/thunks/quotationsThunks";
import { Company, Client, Invoice, Quotation } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadIcon, EditIcon, TrashIcon } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import InvoicePDF from "@/components/pdf/InvoicePDF";
import QuotationPDF from "@/components/pdf/QuotationPDF";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { archiveInvoiceThunk } from "@/store/thunks/invoicesThunks";
import { useRouter } from "next/navigation";

interface InvoiceWithDetails extends Invoice {
  companyName: string;
  clientName: string;
}

interface QuotationWithDetails extends Quotation {
  companyName: string;
  partyName: string;
}

export default function InvoiceListPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const companies = useAppSelector((state) => state.companies.companies);
  const clients = useAppSelector((state) => state.clients.clients);
  const [invoicesWithDetails, setInvoicesWithDetails] = React.useState<InvoiceWithDetails[]>([]);
  const [quotationsWithDetails, setQuotationsWithDetails] = React.useState<QuotationWithDetails[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("invoices");

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [invoicesResult, quotationsResult, companiesResult, clientsResult] = await Promise.all([
        dispatch(fetchInvoices()),
        dispatch(fetchQuotations()),
        dispatch(fetchCompanies()),
        dispatch(fetchClients()),
      ]);

      if (
        fetchCompanies.fulfilled.match(companiesResult) &&
        fetchClients.fulfilled.match(clientsResult)
      ) {
        const companiesList = companiesResult.payload;
        const clientsList = clientsResult.payload;

        if (fetchInvoices.fulfilled.match(invoicesResult)) {
          const invoicesList = invoicesResult.payload;
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

        if (fetchQuotations.fulfilled.match(quotationsResult)) {
          const quotationsList = quotationsResult.payload;
          const quotationsWithDetailsList: QuotationWithDetails[] = quotationsList.map(
            (quotation) => {
              const company = companiesList.find((c) => c.id === quotation.companyId);
              let partyName = "Unknown Party";
              
              if (quotation.clientId) {
                const client = clientsList.find((c) => c.id === quotation.clientId);
                if (client) {
                  partyName =
                    client.customerType === "business"
                      ? client.companyName || `${client.firstName} ${client.lastName}`
                      : `${client.firstName} ${client.lastName}`.trim();
                }
              } else if (quotation.toPartyName) {
                partyName = quotation.toPartyName;
              }

              return {
                ...quotation,
                companyName: company?.companyName || "Unknown Company",
                partyName,
              };
            }
          );
          setQuotationsWithDetails(quotationsWithDetailsList);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
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

  const generateQuotationPDF = async (
    quotation: Quotation,
    company: Company,
    client: Client | null,
    toPartyName: string | null,
    toPartyAddress: string | null
  ): Promise<Blob> => {
    const html = renderToStaticMarkup(
      <QuotationPDF
        quotation={quotation}
        company={company}
        client={client}
        toPartyName={toPartyName}
        toPartyAddress={toPartyAddress}
      />
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

  const handleDownloadQuotation = async (quotation: QuotationWithDetails) => {
    try {
      const company = companies.find((c) => c.id === quotation.companyId);
      if (!company) {
        alert("Company information not found for this quotation.");
        return;
      }

      const client = quotation.clientId
        ? clients.find((c) => c.id === quotation.clientId) || null
        : null;

      const blob = await generateQuotationPDF(
        quotation,
        company,
        client,
        quotation.toPartyName,
        quotation.toPartyAddress
      );
      await downloadPDF(blob, `quotation_${quotation.quotationId}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleEditQuotation = (quotation: QuotationWithDetails) => {
    router.push(`/quotation?edit=${quotation.id}`);
  };

  const handleDeleteQuotation = async (quotation: QuotationWithDetails) => {
    if (!confirm(`Are you sure you want to delete quotation ${quotation.quotationId}?`)) {
      return;
    }

    try {
      const result = await dispatch(deleteQuotationThunk({ id: quotation.id }));
      if (deleteQuotationThunk.fulfilled.match(result)) {
        await loadData();
        alert("Quotation deleted successfully.");
      } else {
        alert("Failed to delete quotation. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting quotation:", error);
      alert("Failed to delete quotation. Please try again.");
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

  const quotationColumns: Column<QuotationWithDetails>[] = [
    {
      header: "Company Name",
      accessor: "companyName",
    },
    {
      header: "Party Name",
      accessor: "partyName",
    },
    {
      header: "Quotation ID",
      accessor: "quotationId",
    },
    {
      header: "Subject",
      accessor: "subject",
    },
    {
      header: "Date",
      accessor: (row) => {
        const date = new Date(row.quotationDate);
        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
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
                  onClick={() => handleDownloadQuotation(row)}
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
                  onClick={() => handleEditQuotation(row)}
                >
                  <EditIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Quotation</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteQuotation(row)}
                >
                  <TrashIcon className="size-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Quotation</TooltipContent>
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
            Invoices & Quotations
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Invoices & Quotations
        </h1>
        <RefreshButton onRefresh={loadData} />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="mt-6">
          <DataTable
            data={invoicesWithDetails}
            columns={columns}
            getRowId={(row) => row.id}
            showSerialNumber={true}
            emptyTitle="No invoices found"
            emptyDescription="Get started by creating your first invoice."
          />
        </TabsContent>
        <TabsContent value="quotations" className="mt-6">
          <DataTable
            data={quotationsWithDetails}
            columns={quotationColumns}
            getRowId={(row) => row.id}
            showSerialNumber={true}
            emptyTitle="No quotations found"
            emptyDescription="Get started by creating your first quotation."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

