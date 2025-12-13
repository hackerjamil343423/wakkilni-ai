"use client";

import { useMemo, useState } from "react";
import {
  Treemap,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchTerm } from "../types";

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
    if (roas >= 3) return "#34a853"; // Dark green
    if (roas >= 2) return "#7cb342"; // Light green
    if (roas >= 1) return "#fbbc04"; // Yellow
    if (roas > 0) return "#f57c00"; // Orange
    return "#ea4335"; // Red
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: SearchTerm & { term: string; spend: number; conversions: number; conversionRate: number; roas: number; matchType: string } }> }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-lg w-72">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2 break-words">
          {data.term}
        </p>
        <div className="space-y-1 text-xs">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Match Type:</span> {data.matchType}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Spend:</span> ${data.spend.toFixed(2)}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Conversions:</span> {data.conversions}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Conv. Rate:</span>{" "}
            {(data.conversionRate * 100).toFixed(2)}%
          </p>
          <p
            className={`font-medium ${
              data.roas >= 2
                ? "text-green-600 dark:text-green-400"
                : data.roas > 0
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
            }`}
          >
            <span>ROAS:</span> {data.roas.toFixed(2)}x
          </p>
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

  return (
    <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Search Term Mining</CardTitle>
            <CardDescription>
              Analyze search queries for optimization opportunities (size = spend, color = ROAS)
            </CardDescription>
          </div>
          {selectedTerms.size > 0 && (
            <Button
              onClick={handleAddAsNegative}
              variant="outline"
              size="sm"
              className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Add {selectedTerms.size} as Negative
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Treemap */}
        <div className="w-full h-[400px] bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treeData}
              dataKey="value"
              stroke="#fff"
              fill="#1a73e8"
              content={<CustomTreemapContent selectedTerms={selectedTerms} onSelect={toggleSelection} getRoasColor={getRoasColor} />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* Low Performing Terms Alert */}
        {lowPerformingTerms.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-2">
              ⚠️ {lowPerformingTerms.length} Zombie Terms Found
            </h4>
            <p className="text-xs text-red-800 dark:text-red-400 mb-3">
              These search terms have spent money but generated zero conversions. Consider adding them as negative keywords.
            </p>
            <div className="flex flex-wrap gap-2">
              {lowPerformingTerms.slice(0, 5).map((term) => (
                <button
                  key={term.term}
                  onClick={() => toggleSelection(term.term)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    selectedTerms.has(term.term)
                      ? "bg-red-600 text-white"
                      : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60"
                  }`}
                >
                  {term.term} (${term.spend.toFixed(0)})
                </button>
              ))}
              {lowPerformingTerms.length > 5 && (
                <span className="px-2.5 py-1 text-xs text-red-700 dark:text-red-400">
                  +{lowPerformingTerms.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Total Terms
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.length}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Total Spend
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              ${(data.reduce((sum, t) => sum + t.spend, 0) / 1000).toFixed(1)}k
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Avg Conv. Rate
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(
                (data.reduce((sum, t) => sum + t.conversionRate, 0) / (data.length || 1)) *
                100
              ).toFixed(2)}
              %
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Avg ROAS
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(data.reduce((sum, t) => sum + t.roas, 0) / (data.length || 1)).toFixed(2)}x
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 text-xs space-y-2">
          <div className="font-semibold text-gray-900 dark:text-white mb-2">
            ROAS Color Scale:
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#34a853" }} />
              <span className="text-gray-600 dark:text-gray-400">ROAS &gt;= 3x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#7cb342" }} />
              <span className="text-gray-600 dark:text-gray-400">ROAS &gt;= 2x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#fbbc04" }} />
              <span className="text-gray-600 dark:text-gray-400">ROAS &gt;= 1x</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f57c00" }} />
              <span className="text-gray-600 dark:text-gray-400">ROAS &gt; 0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ea4335" }} />
              <span className="text-gray-600 dark:text-gray-400">ROAS = 0</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
