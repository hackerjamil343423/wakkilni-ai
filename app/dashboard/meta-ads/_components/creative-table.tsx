"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreativePerformance } from "../types";
import { COLUMN_CONFIG, getDefaultColumns } from "../column-config";
import { ColumnSelector } from "./column-selector";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreativeTableProps {
  data: CreativePerformance[];
}

type SortField = string;
type SortDirection = "asc" | "desc";

const getProgressColor = (value: number, type: "hook" | "hold") => {
  if (type === "hook") {
    if (value >= 30) return "bg-emerald-500";
    if (value >= 20) return "bg-amber-500";
    return "bg-red-500";
  }
  // hold rate
  if (value >= 40) return "bg-emerald-500";
  if (value >= 25) return "bg-amber-500";
  return "bg-red-500";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs font-medium">
          Active
        </Badge>
      );
    case "TESTING":
      return (
        <Badge className="bg-blue-50 text-blue-700 border-0 text-xs font-medium">
          Testing
        </Badge>
      );
    case "PAUSED":
      return (
        <Badge className="bg-slate-100 text-slate-600 border-0 text-xs font-medium">
          Paused
        </Badge>
      );
    default:
      return null;
  }
};

export function CreativeTable({ data }: CreativeTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("spend");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(getDefaultColumns());

  // Load saved columns from localStorage on client side
  useEffect(() => {
    const saved = localStorage.getItem("meta-ads-selected-columns");
    if (saved) {
      setSelectedColumns(JSON.parse(saved));
    }
  }, []);

  const itemsPerPage = 5;

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (search) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[sortField as keyof CreativePerformance];
      const bVal = b[sortField as keyof CreativePerformance];

      if (typeof aVal !== "number" || typeof bVal !== "number") {
        return 0;
      }

      const modifier = sortDirection === "asc" ? 1 : -1;
      return (aVal - bVal) * modifier;
    });

    return result;
  }, [data, search, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleColumnsChange = (newColumns: string[]) => {
    setSelectedColumns(newColumns);
    localStorage.setItem("meta-ads-selected-columns", JSON.stringify(newColumns));
  };

  const SortableHeader = ({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 -ml-3 text-xs font-medium text-slate-500 hover:text-slate-900"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    </TableHead>
  );

  const renderCellValue = (
    columnId: string,
    value: any,
    creative: CreativePerformance
  ) => {
    const config = COLUMN_CONFIG[columnId];
    if (!config) return value;

    // Special rendering for specific columns
    if (columnId === "preview") {
      return (
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
          <Image className="w-5 h-5 text-slate-400" />
        </div>
      );
    }

    if (columnId === "name") {
      return (
        <span className="text-sm font-medium text-slate-900">
          {value.replace(/_/g, " ")}
        </span>
      );
    }

    if (columnId === "status") {
      return getStatusBadge(value);
    }

    if (columnId === "hookRate") {
      return (
        <div className="flex items-center gap-2">
          <Progress
            value={value}
            className={cn(
              "h-2 w-16 bg-slate-100",
              "[&>div]:" + getProgressColor(value, "hook")
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              value >= 30
                ? "text-emerald-600"
                : value >= 20
                ? "text-amber-600"
                : "text-red-500"
            )}
          >
            {value.toFixed(1)}%
          </span>
        </div>
      );
    }

    if (columnId === "holdRate") {
      return (
        <div className="flex items-center gap-2">
          <Progress
            value={value}
            className={cn(
              "h-2 w-16 bg-slate-100",
              "[&>div]:" + getProgressColor(value, "hold")
            )}
          />
          <span
            className={cn(
              "text-xs font-medium",
              value >= 40
                ? "text-emerald-600"
                : value >= 25
                ? "text-amber-600"
                : "text-red-500"
            )}
          >
            {value.toFixed(1)}%
          </span>
        </div>
      );
    }

    // Default formatting
    if (config.format) {
      return (
        <span className={cn(
          "text-sm tabular-nums",
          columnId === "cpa" && value <= 50 && "text-emerald-600 font-semibold",
          columnId === "cpa" && value > 50 && "text-red-500 font-semibold"
        )}>
          {config.format(value)}
        </span>
      );
    }

    return <span className="text-sm">{value}</span>;
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Creative Performance
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Ad creative metrics and analysis
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search creatives..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-9 w-[200px] text-sm"
              />
            </div>
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[120px] h-9 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="TESTING">Testing</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
              </SelectContent>
            </Select>
            {/* Column Selector */}
            <ColumnSelector
              selectedColumns={selectedColumns}
              onColumnsChange={handleColumnsChange}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                {selectedColumns.map((columnId) => {
                  const config = COLUMN_CONFIG[columnId];
                  if (!config) return null;

                  if (config.sortable && columnId !== "preview" && columnId !== "name" && columnId !== "status") {
                    return (
                      <SortableHeader key={columnId} field={columnId}>
                        {config.label}
                      </SortableHeader>
                    );
                  }

                  return (
                    <TableHead
                      key={columnId}
                      className="text-xs font-medium text-slate-500"
                    >
                      {config.label}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((creative) => (
                  <TableRow
                    key={creative.id}
                    className="border-slate-100 hover:bg-slate-50/50 cursor-pointer"
                  >
                    {selectedColumns.map((columnId) => {
                      const value = creative[columnId as keyof CreativePerformance];
                      return (
                        <TableCell key={`${creative.id}-${columnId}`} className="text-sm">
                          {renderCellValue(columnId, value, creative)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={selectedColumns.length}
                    className="text-center py-6 text-sm text-slate-500"
                  >
                    No creatives found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} creatives
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600 px-2">
              {currentPage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
