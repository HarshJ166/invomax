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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
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

