"use client";

import { InvoiceForm } from "@/components/molecules/InvoiceForm/InvoiceForm";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import * as React from "react";

export default function InvoicePage() {
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
          Create Invoice
        </h1>
        <RefreshButton onRefresh={handleRefresh} />
      </div>
      <InvoiceForm onRefreshRef={refreshRef} />
    </div>
  );
}
