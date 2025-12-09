"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function RefreshButton({
  onRefresh,
  className,
  variant = "outline",
  size = "icon",
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // As per user request, perform a full page reload to simulate Ctrl+R
    // ensuring all states and data are completely refreshed.
    window.location.reload();
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant={variant}
      size={size}
      className={cn(className)}
      aria-label="Refresh data"
    >
      <RefreshCwIcon
        className={cn(
          "h-4 w-4",
          isRefreshing && "animate-spin"
        )}
      />
      {size !== "icon" && <span className="ml-2">Refresh</span>}
    </Button>
  );
}

