"use client";

import { QuotationForm } from "@/components/molecules/QuotationForm/QuotationForm";
import { RefreshButton } from "@/components/molecules/RefreshButton/RefreshButton";
import * as React from "react";
import { useSearchParams } from "next/navigation";

function QuotationPageContent() {
  const searchParams = useSearchParams();
  const editQuotationId = searchParams?.get("edit") ?? null;
  const refreshRef = React.useRef<(() => Promise<void>) | undefined>(undefined);

  const handleRefresh = React.useCallback(async () => {
    if (refreshRef.current) {
      await refreshRef.current();
    }
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {editQuotationId ? "Edit Quotation" : "Create Quotation"}
        </h1>
        <RefreshButton onRefresh={handleRefresh} />
      </div>
      <QuotationForm onRefreshRef={refreshRef} editQuotationId={editQuotationId || undefined} />
    </div>
  );
}

export default function QuotationPage() {
  return (
    <React.Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Create Quotation
          </h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <QuotationPageContent />
    </React.Suspense>
  );
}

