"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  MoreHorizontalIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DatabaseIcon,
  InfoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import OverflowableText from "@/components/molecules/OverflowableText/OverflowableText";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onCreate?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onInfo?: (row: T) => void;
  getRowId?: (row: T) => string | number;
  showSerialNumber?: boolean;
  createButtonLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    currentPage?: number;
    total?: number;
    onPageChange?: (page: number) => void;
  };
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  onCreate,
  onEdit,
  onDelete,
  onInfo,
  getRowId,
  showSerialNumber = true,
  createButtonLabel = "Add New",
  emptyTitle = "No data available",
  emptyDescription = "Get started by adding your first item.",
  className,
  pagination,
}: DataTableProps<T>) {
  const hasActions = Boolean(onEdit || onDelete || onInfo);
  const isPaginationEnabled = pagination?.enabled ?? false;
  const pageSize = pagination?.pageSize ?? 10;
  const currentPage = pagination?.currentPage ?? 1;
  const total = pagination?.total ?? data.length;
  const totalPages = Math.ceil(total / pageSize);

  const displayedData = isPaginationEnabled
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  const handlePageChange = (newPage: number) => {
    if (pagination?.onPageChange && newPage >= 1 && newPage <= totalPages) {
      pagination.onPageChange(newPage);
    }
  };

  const getCellValue = (column: Column<T>, row: T): React.ReactNode => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };

  const renderCell = (column: Column<T>, row: T): React.ReactNode => {
    const value = getCellValue(column, row);
    if (column.render) {
      return column.render(value, row);
    }
    return value ?? "-";
  };

  const getUniqueId = (row: T, index: number): string | number => {
    if (getRowId) {
      return getRowId(row);
    }
    return index;
  };

  if (data.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        {onCreate && (
          <div className="mb-4 flex justify-end">
            <Button onClick={onCreate}>
              <PlusIcon />
              {createButtonLabel}
            </Button>
          </div>
        )}
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <DatabaseIcon />
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
          {onCreate && (
            <EmptyContent>
              <Button onClick={onCreate}>
                <PlusIcon />
                {createButtonLabel}
              </Button>
            </EmptyContent>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {onCreate && (
        <div className="flex justify-end">
          <Button onClick={onCreate}>
            <PlusIcon />
            {createButtonLabel}
          </Button>
        </div>
      )}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {showSerialNumber && (
                <TableHead className="w-16 text-center">Sr.No</TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead key={index} className={cn(column.className)}>
                  <OverflowableText
                    content={column.header}
                    maxLength={20}
                    className="truncate block"
                  />
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="w-16 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedData.map((row, rowIndex) => {
              const globalIndex = isPaginationEnabled
                ? (currentPage - 1) * pageSize + rowIndex
                : rowIndex;
              return (
                <TableRow key={getUniqueId(row, globalIndex)}>
                  {showSerialNumber && (
                    <TableCell className="text-center text-muted-foreground">
                      {globalIndex + 1}
                    </TableCell>
                  )}
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={cn(column.className)}>
                    {renderCell(column, row)}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onInfo && (
                          <DropdownMenuItem onClick={() => onInfo(row)}>
                            <InfoIcon />
                            Info
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(row)}>
                            <PencilIcon />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(row)}
                          >
                            <TrashIcon />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {isPaginationEnabled && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to{" "}
            {Math.min(currentPage * pageSize, total)} of {total} entries
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={cn(
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={cn(
                    currentPage >= totalPages && "pointer-events-none opacity-50"
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
