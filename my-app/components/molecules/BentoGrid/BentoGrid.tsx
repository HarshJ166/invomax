"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  FileCheck, 
  Package, 
  ArrowRight, 
  Users, 
  Building2, 
  ShoppingCart, 
  Receipt,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/molecules/StatsCard/StatsCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Company, Item, DealerPayment, Client, Invoice } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface BentoGridProps {
  companies: Company[];
  items: Item[];
  invoices?: Invoice[];
  dealerPayments?: DealerPayment[];
  clients?: Client[];
  className?: string;
}

interface DashboardStats {
  totalAmount: number;
  invoiceCount: number;
  totalDebt: number;
}

const calculateStats = (
  companies: Company[],
  invoices: Invoice[] = [],
  dealerPayments: DealerPayment[] = [],
  selectedCompanyId?: string
): DashboardStats => {
  const filteredInvoices = selectedCompanyId
    ? invoices.filter((invoice) => invoice.companyId === selectedCompanyId)
    : invoices;

  const totalAmount = filteredInvoices.reduce(
    (sum, invoice) => sum + (invoice.totalAmount || 0),
    0
  );

  const invoiceCount = invoices.length;

  const filteredDealerPayments = selectedCompanyId
    ? dealerPayments.filter((payment) => payment.companyId === selectedCompanyId)
    : dealerPayments;

  const totalDebt = filteredDealerPayments.reduce((sum, payment) => {
    if (payment.paymentStatus === "unpaid") {
      return sum + (payment.billAmountTotal || 0);
    } else if (payment.paymentStatus === "partial_paid") {
      return sum + (payment.balanceAmount || 0);
    }
    return sum;
  }, 0);

  return {
    totalAmount,
    invoiceCount,
    totalDebt,
  };
};

const getClientName = (client: Client | undefined): string => {
  if (!client) return "Unknown Client";
  if (client.customerType === "business") {
    return client.companyName || `${client.firstName} ${client.lastName}`;
  }
  return `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unknown Client";
};

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "paid":
      return "default";
    case "sent":
      return "secondary";
    case "overdue":
      return "destructive";
    default:
      return "outline";
  }
};

const getRandomItems = (items: Item[], count: number): Item[] => {
  if (items.length === 0) return [];
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, items.length));
};

export function BentoGrid({
  companies,
  items,
  invoices = [],
  dealerPayments = [],
  clients = [],
  className,
}: BentoGridProps) {
  const router = useRouter();
  const [selectedCompanyId, setSelectedCompanyId] =
    React.useState<string>("all");

  const stats = React.useMemo(
    () =>
      calculateStats(
        companies,
        invoices,
        dealerPayments,
        selectedCompanyId === "all" ? undefined : selectedCompanyId
      ),
    [companies, invoices, dealerPayments, selectedCompanyId]
  );

  const randomItems = React.useMemo(() => getRandomItems(items, 3), [items]);

  const lastInvoices = React.useMemo(() => {
    const sorted = [...invoices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    return sorted.map((invoice) => {
      const client = clients.find((c) => c.id === invoice.clientId);
      return {
        ...invoice,
        clientName: getClientName(client),
      };
    });
  }, [invoices, clients]);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const descriptionText = selectedCompany
    ? `Total revenue from ${selectedCompany.companyName}`
    : "Total revenue from all invoices";

  const handleCreateInvoice = () => {
    router.push("/invoice");
  };

  const handleCreateQuotation = () => {
    router.push("/quotation");
  };

  const handleViewInvoices = () => {
    router.push("/invoice-list");
  };

  const handleViewDealerPayments = () => {
    router.push("/dealer-payment");
  };

  const handleViewItems = () => {
    router.push("/items");
  };

  const handleNavigateToPage = (path: string) => {
    router.push(path);
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-lg font-bold text-foreground">
                  Total Invoice Amount
                </CardTitle>
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                >
                  <SelectTrigger className="w-[180px] h-9 text-sm border-2">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {descriptionText}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-bold text-foreground">
                ₹
                {stats.totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <StatsCard
          title="Invoices Generated"
          description="Total number of invoices"
          value={stats.invoiceCount}
          className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
          valueClassName="text-3xl"
          onClick={handleViewInvoices}
        />

        <StatsCard
          title="Total Debt"
          description={
            selectedCompanyId === "all"
              ? "Outstanding amount to be paid to dealers/clients"
              : `Outstanding amount to be paid to dealers/clients for ${selectedCompany?.companyName || ""}`
          }
          value={`₹${stats.totalDebt.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
          valueClassName="text-3xl text-destructive"
          onClick={handleViewDealerPayments}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50 bg-gradient-to-br from-white to-primary/5"
          onClick={handleCreateInvoice}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-primary" />
                Create Invoice
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate a new invoice quickly
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50 bg-gradient-to-br from-white to-primary/5"
          onClick={handleCreateQuotation}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCheck className="h-5 w-5 text-primary" />
                Create Quotation
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create a new quotation for clients
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50 bg-gradient-to-br from-white to-primary/5"
          onClick={handleViewItems}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-primary" />
                Items Overview
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {randomItems.length > 0 ? (
                randomItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate flex-1 font-medium">{item.itemName}</span>
                    <span className="text-muted-foreground ml-2 whitespace-nowrap">
                      Stock: {item.qtyAvailable}
                      {item.unit ? ` ${item.unit}` : ""}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No items available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50 bg-gradient-to-br from-white to-primary/5"
          onClick={() => handleNavigateToPage("/client")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" />
                Clients
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage your clients
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50 bg-gradient-to-br from-white to-primary/5"
          onClick={() => handleNavigateToPage("/companies")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-primary" />
                Companies
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage companies
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50 bg-gradient-to-br from-white to-primary/5"
          onClick={() => handleNavigateToPage("/purchase-entry")}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Purchase Entry
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Record purchases
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Receipt className="h-5 w-5 text-primary" />
              Recent Invoices
            </CardTitle>
            <button
              onClick={handleViewInvoices}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {lastInvoices.length > 0 ? (
            <div className="space-y-3">
              {lastInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleViewInvoices()}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground">
                        {invoice.invoiceNumber}
                      </span>
                      <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {invoice.clientName}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="font-bold text-foreground">
                      ₹{invoice.totalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No invoices created yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
