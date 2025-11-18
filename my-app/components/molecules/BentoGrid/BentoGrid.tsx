"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  TrendingUp,
  Package,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/molecules/StatsCard/StatsCard";
import { cn } from "@/lib/utils";
import { Company, Item } from "@/lib/types";

interface BentoGridProps {
  companies: Company[];
  items: Item[];
  className?: string;
}

interface DashboardStats {
  totalAmount: number;
  invoiceCount: number;
  totalDebt: number;
}

const calculateStats = (companies: Company[]): DashboardStats => {
  return companies.reduce(
    (acc, company) => ({
      totalAmount: acc.totalAmount + (company.revenueTotal || 0),
      invoiceCount: acc.invoiceCount + (company.invoiceCount || 0),
      totalDebt: acc.totalDebt + (company.debt || 0),
    }),
    { totalAmount: 0, invoiceCount: 0, totalDebt: 0 }
  );
};

const getRandomItems = (items: Item[], count: number): Item[] => {
  if (items.length === 0) return [];
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, items.length));
};

export function BentoGrid({
  companies,
  items,
  className,
}: BentoGridProps) {
  const router = useRouter();
  const stats = React.useMemo(() => calculateStats(companies), [companies]);
  const randomItems = React.useMemo(
    () => getRandomItems(items, 3),
    [items]
  );

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
          <StatsCard
            title="Total Invoice Amount"
            description="Total revenue from all invoices"
            value={`₹${stats.totalAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            className="h-full"
            valueClassName="text-3xl"
          />
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
          description="Outstanding amount to be received"
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
                      Stock: {item.qtyAvailable}{item.unit ? ` ${item.unit}` : ""}
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

