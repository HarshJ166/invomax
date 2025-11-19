"use client";

import * as React from "react";
import { BentoGrid } from "@/components/molecules/BentoGrid/BentoGrid";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCompanies } from "@/store/thunks/companiesThunks";
import { fetchItems } from "@/store/thunks/itemsThunks";
import { fetchInvoices } from "@/store/thunks/invoicesThunks";
import { fetchDealers } from "@/store/thunks/dealersThunks";
import { Invoice, DealerPayment } from "@/lib/types";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);
  const items = useAppSelector((state) => state.items.items);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [dealerPayments, setDealerPayments] = React.useState<DealerPayment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [, , invoicesResult, dealersResult] = await Promise.all([
        dispatch(fetchCompanies()),
        dispatch(fetchItems()),
        dispatch(fetchInvoices()),
        dispatch(fetchDealers()),
      ]);
      
      if (fetchInvoices.fulfilled.match(invoicesResult)) {
        setInvoices(invoicesResult.payload);
      }
      
      if (fetchDealers.fulfilled.match(dealersResult)) {
        setDealerPayments(dealersResult.payload);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome to your invoice management dashboard. View statistics and
            quick actions below.
          </p>
        </div>
        <RefreshButton onRefresh={fetchData} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      ) : (
        <BentoGrid companies={companies} items={items} invoices={invoices} dealerPayments={dealerPayments} />
      )}
    </div>
  );
}
