"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  description?: string;
  value: string | number;
  className?: string;
  valueClassName?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  description,
  value,
  className,
  valueClassName,
  onClick,
}: StatsCardProps) {
  return (
    <Card 
      className={cn(
        "bg-white dark:bg-gray-50 border-gray-200",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-black dark:text-black">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs text-gray-600 dark:text-gray-700 mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className={cn(
            "text-2xl font-semibold text-black dark:text-black",
            valueClassName
          )}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </CardContent>
    </Card>
  );
}
