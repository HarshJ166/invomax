"use client";

import * as React from "react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to your invoice management dashboard. Use the sidebar to navigate between sections.
        </p>
      </div>
    </div>
  );
}

