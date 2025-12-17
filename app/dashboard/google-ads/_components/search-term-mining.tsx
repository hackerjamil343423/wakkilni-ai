"use client";

import { useMemo, useState } from "react";
import {
  Treemap,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { SearchTerm } from "../types";
import { Search, MinusCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchTermMiningProps {
  data: SearchTerm[];
}

export function SearchTermMining({ data }: SearchTermMiningProps) {
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());

  const treeData = useMemo(() => {
    return {
      name: "Search Terms",
      children: data.map((term) => ({
        name: term.term,
        value: Math.max(term.spend, 100),
        term: term.term,
        spend: term.spend,
        conversions: term.conversions,
        conversionRate: term.conversionRate,
        roas: term.roas,
        matchType: term.matchType,
      })),
    };
  }, [data]);

  const getRoasColor = (roas: number): string => {
    if (roas >= 3) return "#10b981"; // emerald
    if (roas >= 2) return "#3b82f6"; // blue
    if (roas >= 1) return "#f59e0b"; // amber
    if (roas > 0) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: SearchTerm & { term: string; spend: number; conversions: number; conversionRate: number; roas: number; matchType: string } }> }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-xl min-w-[220px]">
        <p className="text-sm font-semibold text-white mb-3 pb-2 border-b border-zinc-700 break-words">
          {data.term}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">Match Type</span>
            <span className="text-xs font-medium text-zinc-200">{data.matchType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">Spend</span>
            <span className="text-sm font-semibold text-white tabular-nums">${data.spend.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">Conversions</span>
            <span className="text-sm font-semibold text-white tabular-nums">{data.conversions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">Conv. Rate</span>
            <span className="text-sm font-semibold text-white tabular-nums">{(data.conversionRate * 100).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
            <span className="text-xs text-zinc-400">ROAS</span>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              data.roas >= 2 ? "text-emerald-400" : data.roas >= 1 ? "text-amber-400" : "text-red-400"
            )}>
              {data.roas.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>
    );
  };

  const toggleSelection = (term: string) => {
    const newSelected = new Set(selectedTerms);
    if (newSelected.has(term)) {
      newSelected.delete(term);
    } else {
      newSelected.add(term);
    }
    setSelectedTerms(newSelected);
  };

  const handleAddAsNegative = () => {
    if (selectedTerms.size > 0) {
      alert(
        `Added ${selectedTerms.size} terms as negative keywords:\n${Array.from(selectedTerms).join("\n")}`
      );
      setSelectedTerms(new Set());
    }
  };

  const lowPerformingTerms = data.filter(
    (t) => t.spend > 100 && t.conversions === 0
  );
  const totalSpend = data.reduce((sum, t) => sum + t.spend, 0);
  const totalTerms = data.length;
  const avgConvRate = (data.reduce((sum, t) => sum + t.conversionRate, 0) / (data.length || 1)) * 100;
  const avgRoas = data.reduce((sum, t) => sum + t.roas, 0) / (data.length || 1);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                Search Term Mining
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Size = spend, Color = ROAS
              </p>
            </div>
          </div>
          {selectedTerms.size > 0 && (
            <Button
              onClick={handleAddAsNegative}
              size="sm"
              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              <MinusCircle className="h-3.5 w-3.5 mr-1.5" />
              Add {selectedTerms.size} as Negative
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800">
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Terms</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{totalTerms}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Spend</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
            ${(totalSpend / 1000).toFixed(1)}k
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg Conv. Rate</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{avgConvRate.toFixed(2)}%</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg ROAS</div>
          <div className={cn("text-xl font-semibold tabular-nums", avgRoas >= 2 ? "text-emerald-600 dark:text-emerald-400" : avgRoas >= 1 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
            {avgRoas.toFixed(2)}x
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Treemap */}
        <div className="w-full h-[400px] bg-zinc-50 dark:bg-zinc-800/30 rounded-xl overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeData}
              dataKey="value"
              stroke="#fff"
              fill="#3b82f6"
              content={<CustomTreemapContent selectedTerms={selectedTerms} onSelect={toggleSelection} getRoasColor={getRoasColor} />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* Low Performing Terms Alert */}
        {lowPerformingTerms.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-300 text-sm">
                  {lowPerformingTerms.length} Zombie Terms Found
                </h4>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                  Terms spending money with zero conversions
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowPerformingTerms.slice(0, 5).map((term) => (
                <button
                  key={term.term}
                  onClick={() => toggleSelection(term.term)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                    selectedTerms.has(term.term)
                      ? "bg-red-600 text-white"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60"
                  )}
                >
                  {term.term} (${term.spend.toFixed(0)})
                </button>
              ))}
              {lowPerformingTerms.length > 5 && (
                <span className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 font-medium">
                  +{lowPerformingTerms.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">ROAS 3x+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">ROAS 2x+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">ROAS 1x+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">ROAS 0+</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">No ROAS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TreemapChild {
  name: string;
  value: number;
  term: string;
  spend: number;
  conversions: number;
  conversionRate: number;
  roas: number;
  matchType: string;
}

interface TreemapPayload {
  name: string;
  children: TreemapChild[];
}

interface CustomTreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: TreemapPayload;
  selectedTerms: Set<string>;
  onSelect: (term: string) => void;
  getRoasColor: (roas: number) => string;
}

function CustomTreemapContent(props: CustomTreemapContentProps) {
  const { x, y, width, height, payload, selectedTerms, onSelect, getRoasColor } = props;

  if (!payload || !payload.children) return null;

  return (
    <>
      {payload.children.map((child: TreemapChild, index: number) => {
        const childWidth = (width * child.value) / payload.children.reduce((sum: number, c: TreemapChild) => sum + c.value, 0);
        const childHeight = height;
        const color = getRoasColor(child.roas);
        const isSelected = selectedTerms.has(child.term);

        return (
          <g key={`child-${index}`}>
            <rect
              x={x}
              y={y}
              width={childWidth}
              height={childHeight}
              fill={color}
              fillOpacity={isSelected ? 1 : 0.7}
              stroke={isSelected ? "#000" : "#fff"}
              strokeWidth={isSelected ? 3 : 1}
              onClick={() => onSelect(child.term)}
              style={{ cursor: "pointer" }}
              className="hover:opacity-100 transition-opacity"
            />
            {childWidth > 40 && childHeight > 30 && (
              <text
                x={x + childWidth / 2}
                y={y + childHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fill="#fff"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {child.term.substring(0, Math.floor(childWidth / 4))}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}
