"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, TrendingUp, Package, ArrowRight } from "lucide-react";
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
import { Company, Item, DealerPayment } from "@/lib/types";

interface Invoice {
  id: string;
  companyId: string;
  totalAmount: number;
  status: string;
}

interface BentoGridProps {
  companies: Company[];
  items: Item[];
  invoices?: Invoice[];
  dealerPayments?: DealerPayment[];
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

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const descriptionText = selectedCompany
    ? `Total revenue from ${selectedCompany.companyName}`
    : "Total revenue from all invoices";

  const handleCreateInvoice = () => {
    router.push("/invoice");
  };

  const handleViewTrend = () => {
    router.push("/invoice-list");
  };

  const handleViewItems = () => {
    router.push("/items");
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <Card className="h-full bg-white dark:bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base font-bold text-black dark:text-black">
                  Total Invoice Amount
                </CardTitle>
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                >
                  <SelectTrigger className="w-[25%] h-8 text-sm">
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
              <p className="text-xs text-gray-600 dark:text-gray-700 mt-1">
                {descriptionText}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-semibold text-black dark:text-black">
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
          className="h-full"
          valueClassName="text-3xl"
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
          className="h-full"
          valueClassName="text-3xl text-destructive"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-2 hover:border-primary/50"
          onClick={handleCreateInvoice}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Create Invoice
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate a new invoice quickly
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-2 hover:border-primary/50"
          onClick={handleViewTrend}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                View Trends
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Analyze invoice generation trends
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-2 hover:border-primary/50 lg:col-span-1"
          onClick={handleViewItems}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Items Overview
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
                    <span className="truncate flex-1">{item.itemName}</span>
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
    </div>
  );
}
