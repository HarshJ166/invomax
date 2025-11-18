"use client";

import * as React from "react";
import { BentoGrid } from "@/components/molecules/BentoGrid/BentoGrid";
import { dbService } from "@/lib/db-service";
import { Company, Item } from "@/lib/types";

export default function DashboardPage() {
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [items, setItems] = React.useState<Item[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [companiesData, itemsData] = await Promise.all([
          dbService.companies.getAll(),
          dbService.items.getAll(),
        ]);
        setCompanies(companiesData as Company[]);
        setItems(itemsData as Item[]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to your invoice management dashboard. View statistics and
          quick actions below.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      ) : (
        <BentoGrid companies={companies} items={items} />
      )}
    </div>
  );
}
