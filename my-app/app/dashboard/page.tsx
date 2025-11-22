"use client";

import * as React from "react";
import { BentoGrid } from "@/components/molecules/BentoGrid/BentoGrid";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCompanies } from "@/store/thunks/companiesThunks";
import { fetchItems } from "@/store/thunks/itemsThunks";
import { fetchInvoices } from "@/store/thunks/invoicesThunks";
import { fetchDealers } from "@/store/thunks/dealersThunks";
import { fetchClients } from "@/store/thunks/clientsThunks";
import { Invoice, DealerPayment, Client } from "@/lib/types";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);
  const items = useAppSelector((state) => state.items.items);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [dealerPayments, setDealerPayments] = React.useState<DealerPayment[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [, , invoicesResult, dealersResult, clientsResult] = await Promise.all([
        dispatch(fetchCompanies()),
        dispatch(fetchItems()),
        dispatch(fetchInvoices()),
        dispatch(fetchDealers()),
        dispatch(fetchClients()),
      ]);
      
      if (fetchInvoices.fulfilled.match(invoicesResult)) {
        setInvoices(invoicesResult.payload);
      }
      
      if (fetchDealers.fulfilled.match(dealersResult)) {
        setDealerPayments(dealersResult.payload);
      }

      if (fetchClients.fulfilled.match(clientsResult)) {
        setClients(clientsResult.payload);
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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-base">
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
        <BentoGrid 
          companies={companies} 
          items={items} 
          invoices={invoices} 
          dealerPayments={dealerPayments}
          clients={clients}
        />
      )}
    </div>
  );
}
