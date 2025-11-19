"use client";

import { InvoiceForm } from "@/components/molecules/InvoiceForm/InvoiceForm";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import * as React from "react";
import { useSearchParams } from "next/navigation";

function InvoicePageContent() {
  const searchParams = useSearchParams();
  const editInvoiceId = searchParams.get("edit");
  const refreshRef = React.useRef<(() => Promise<void>) | undefined>();

  const handleRefresh = React.useCallback(async () => {
    if (refreshRef.current) {
      await refreshRef.current();
    }
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {editInvoiceId ? "Edit Invoice" : "Create Invoice"}
        </h1>
        <RefreshButton onRefresh={handleRefresh} />
      </div>
      <InvoiceForm onRefreshRef={refreshRef} editInvoiceId={editInvoiceId || undefined} />
    </div>
  );
}

export default function InvoicePage() {
  return (
    <React.Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Create Invoice
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <InvoicePageContent />
    </React.Suspense>
  );
}
