"use client";

import { useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ZAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QualityScoreDataPoint } from "../types";

interface QualityScoreMatrixProps {
  data: QualityScoreDataPoint[];
}

export function QualityScoreMatrix({ data }: QualityScoreMatrixProps) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!selectedFilter) return data;

    if (selectedFilter === "below_average") {
      return data.filter(
        (d) =>
          d.expectedCTR === "BELOW_AVERAGE" ||
          d.adRelevance === "BELOW_AVERAGE" ||
          d.landingPageExperience === "BELOW_AVERAGE"
      );
    }

    if (selectedFilter === "high_spend_low_quality") {
      return data.filter((d) => d.spend > 1500 && d.qualityScore < 6);
    }

    if (selectedFilter === "high_cpa") {
      return data.filter((d) => d.cpa > 75);
    }

    return data;
  }, [data, selectedFilter]);

  const getQualityColor = (point: QualityScoreDataPoint): string => {
    const allAboveAverage =
      point.expectedCTR === "ABOVE_AVERAGE" &&
      point.adRelevance === "ABOVE_AVERAGE" &&
      point.landingPageExperience === "ABOVE_AVERAGE";

    const allBelowAverage =
      point.expectedCTR === "BELOW_AVERAGE" ||
      point.adRelevance === "BELOW_AVERAGE" ||
      point.landingPageExperience === "BELOW_AVERAGE";

    if (allAboveAverage) return "#34a853"; // Green
    if (allBelowAverage) return "#ea4335"; // Red
    return "#fbbc04"; // Yellow
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as QualityScoreDataPoint;

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 shadow-lg w-64">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {data.keyword}
        </p>
        <div className="space-y-1 text-xs">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Quality Score:</span> {data.qualityScore}/10
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">CPA:</span> ${data.cpa.toFixed(2)}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Spend:</span> ${data.spend.toFixed(2)}
          </p>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p
              className={`text-xs font-medium ${
                data.expectedCTR === "ABOVE_AVERAGE"
                  ? "text-green-600 dark:text-green-400"
                  : data.expectedCTR === "BELOW_AVERAGE"
                    ? "text-red-600 dark:text-red-400"
                    : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              Expected CTR: {data.expectedCTR}
            </p>
            <p
              className={`text-xs font-medium ${
                data.adRelevance === "ABOVE_AVERAGE"
                  ? "text-green-600 dark:text-green-400"
                  : data.adRelevance === "BELOW_AVERAGE"
                    ? "text-red-600 dark:text-red-400"
                    : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              Ad Relevance: {data.adRelevance}
            </p>
            <p
              className={`text-xs font-medium ${
                data.landingPageExperience === "ABOVE_AVERAGE"
                  ? "text-green-600 dark:text-green-400"
                  : data.landingPageExperience === "BELOW_AVERAGE"
                    ? "text-red-600 dark:text-red-400"
                    : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              Landing Page: {data.landingPageExperience}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Quality Score Matrix</CardTitle>
            <CardDescription>
              Keyword quality score vs CPA analysis (bubble size = spend)
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === null
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter("below_average")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === "below_average"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              Below Avg
            </button>
            <button
              onClick={() => setSelectedFilter("high_spend_low_quality")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === "high_spend_low_quality"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              Budget Bleeders
            </button>
            <button
              onClick={() => setSelectedFilter("high_cpa")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === "high_cpa"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              High CPA
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <defs>
                <linearGradient id="colorScatter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34a853" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ea4335" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                type="number"
                dataKey="qualityScore"
                domain={[1, 10]}
                name="Quality Score"
                label={{ value: "Quality Score (1-10)", offset: 10 }}
                stroke="#6b7280"
              />
              <YAxis
                type="number"
                dataKey="cpa"
                name="CPA"
                label={{ value: "CPA ($)", angle: -90, position: "insideLeft" }}
                stroke="#6b7280"
              />
              <ZAxis
                type="number"
                dataKey="spend"
                range={[50, 400]}
                name="Spend"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.1)" }} />
              <Legend />
              <Scatter
                name="Keywords"
                data={filteredData}
                fill="url(#colorScatter)"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getQualityColor(entry)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Keywords Analyzed
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {filteredData.length}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Avg Quality Score
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(
                filteredData.reduce((sum, k) => sum + k.qualityScore, 0) /
                (filteredData.length || 1)
              ).toFixed(1)}
              /10
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Avg CPA
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              $
              {(
                filteredData.reduce((sum, k) => sum + k.cpa, 0) /
                (filteredData.length || 1)
              ).toFixed(0)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Total Spend
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              $
              {(
                filteredData.reduce((sum, k) => sum + k.spend, 0) / 1000
              ).toFixed(1)}
              k
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 text-xs space-y-2">
          <div className="font-semibold text-gray-900 dark:text-white mb-2">
            Quality Component Status:
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#34a853" }} />
            <span className="text-gray-600 dark:text-gray-400">
              All components above average
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#fbbc04" }} />
            <span className="text-gray-600 dark:text-gray-400">
              Mixed component status
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ea4335" }} />
            <span className="text-gray-600 dark:text-gray-400">
              One or more components below average
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
