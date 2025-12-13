"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  COLUMN_CONFIG,
  getColumnsByCategory,
  getCategoryLabel,
  getDefaultColumns,
  ColumnCategory,
} from "../column-config";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColumnSelectorProps {
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
}

const CATEGORY_ORDER: ColumnCategory[] = ['basic', 'engagement', 'video', 'conversion', 'cost', 'quality'];

export function ColumnSelector({
  selectedColumns,
  onColumnsChange,
}: ColumnSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const columnsByCategory = useMemo(() => {
    return getColumnsByCategory();
  }, []);

  const filteredColumnsByCategory = useMemo(() => {
    const filtered: Record<ColumnCategory, typeof COLUMN_CONFIG[keyof typeof COLUMN_CONFIG][]> = {
      basic: [],
      engagement: [],
      video: [],
      conversion: [],
      cost: [],
      quality: [],
    };

    Object.entries(columnsByCategory).forEach(([category, columns]) => {
      filtered[category as ColumnCategory] = columns.filter((col) =>
        col.label.toLowerCase().includes(search.toLowerCase())
      );
    });

    return filtered;
  }, [columnsByCategory, search]);

  const handleToggleColumn = (columnId: string) => {
    if (selectedColumns.includes(columnId)) {
      onColumnsChange(selectedColumns.filter((id) => id !== columnId));
    } else {
      onColumnsChange([...selectedColumns, columnId]);
    }
  };

  const handleSelectCategory = (category: ColumnCategory) => {
    const categoryColumns = columnsByCategory[category].map((col) => col.id);
    const allSelected = categoryColumns.every((id) => selectedColumns.includes(id));

    if (allSelected) {
      onColumnsChange(
        selectedColumns.filter((id) => !categoryColumns.includes(id))
      );
    } else {
      const newSelected = new Set(selectedColumns);
      categoryColumns.forEach((id) => newSelected.add(id));
      onColumnsChange(Array.from(newSelected));
    }
  };

  const handleResetToDefaults = () => {
    onColumnsChange(getDefaultColumns());
  };

  const hasAnyCategory = Object.values(filteredColumnsByCategory).some(
    (cols) => cols.length > 0
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 border-slate-200 hover:bg-slate-50 text-sm"
        >
          Columns ({selectedColumns.length})
          <ChevronDown className="ml-2 h-4 w-4 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <div className="p-4">
          {/* Search */}
          <Input
            placeholder="Search metrics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm mb-3"
          />

          {/* Categories */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {CATEGORY_ORDER.map((category) => {
              const cols = filteredColumnsByCategory[category];
              if (cols.length === 0) return null;

              const allSelected = cols.every((col) =>
                selectedColumns.includes(col.id)
              );
              const someSelected = cols.some((col) =>
                selectedColumns.includes(col.id)
              );

              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700">
                      {getCategoryLabel(category)}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleSelectCategory(category)}
                    >
                      {allSelected ? "Deselect" : "Select"} All
                    </Button>
                  </div>

                  {/* Column Checkboxes */}
                  <div className="space-y-2 pl-1">
                    {cols.map((col) => (
                      <div
                        key={col.id}
                        className="flex items-center gap-2 p-1 rounded hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleToggleColumn(col.id)}
                      >
                        <Checkbox
                          checked={selectedColumns.includes(col.id)}
                          onCheckedChange={() => handleToggleColumn(col.id)}
                          className="cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <label className="text-sm text-slate-700 cursor-pointer block truncate">
                            {col.label}
                          </label>
                          {col.description && (
                            <p className="text-xs text-slate-500 truncate">
                              {col.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Separator */}
                  {category !== CATEGORY_ORDER[CATEGORY_ORDER.length - 1] && (
                    <div className="my-3 border-t border-slate-200" />
                  )}
                </div>
              );
            })}

            {/* No results message */}
            {!hasAnyCategory && (
              <p className="text-sm text-slate-500 py-4 text-center">
                No metrics found
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleResetToDefaults}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
