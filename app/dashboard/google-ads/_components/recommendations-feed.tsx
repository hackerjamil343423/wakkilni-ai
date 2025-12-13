"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recommendation } from "../types";
import {
  Lightbulb,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Target,
  DollarSign,
  Zap,
  Package,
  CheckCircle,
} from "lucide-react";

interface RecommendationsFeedProps {
  data: Recommendation[];
}

export function RecommendationsFeed({ data }: RecommendationsFeedProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [filterImpact, setFilterImpact] = useState<"all" | "HIGH" | "MEDIUM" | "LOW">("all");

  const filteredRecommendations = data.filter((rec) => {
    if (dismissedIds.has(rec.id)) return false;
    if (filterImpact !== "all" && rec.impact !== filterImpact) return false;
    return true;
  });

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
  };

  const handleApply = (id: string) => {
    // In a real app, this would trigger the recommendation to be applied via API
    alert(`Applied recommendation ${id}. In production, this would trigger the API call.`);
    handleDismiss(id);
  };

  const getRecommendationIcon = (type: string) => {
    if (type.includes("CPA") || type.includes("BIDDING")) return <Target className="h-5 w-5" />;
    if (type.includes("BUDGET")) return <DollarSign className="h-5 w-5" />;
    if (type.includes("KEYWORD")) return <Zap className="h-5 w-5" />;
    if (type.includes("PRODUCT") || type.includes("SHOPPING")) return <Package className="h-5 w-5" />;
    if (type.includes("AD") || type.includes("CREATIVE")) return <CheckCircle className="h-5 w-5" />;
    return <Lightbulb className="h-5 w-5" />;
  };

  const getImpactColor = (impact: string) => {
    if (impact === "HIGH")
      return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300";
    if (impact === "MEDIUM")
      return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300";
    return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300";
  };

  const getImpactBadgeColor = (impact: string) => {
    if (impact === "HIGH") return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    if (impact === "MEDIUM") return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  };

  const highImpactCount = data.filter((r) => r.impact === "HIGH" && !dismissedIds.has(r.id)).length;
  const totalRecommendations = data.length;
  const appliedCount = dismissedIds.size;
  const potentialImpact = data
    .filter((r) => r.impact === "HIGH" && !dismissedIds.has(r.id))
    .reduce((sum, r) => sum + (r.estimatedConversions || r.estimatedClicks || 0), 0);

  return (
    <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Optimization Recommendations
            </CardTitle>
            <CardDescription>
              AI-powered suggestions to improve campaign performance
            </CardDescription>
          </div>
          <select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value as "all" | "HIGH" | "MEDIUM" | "LOW")}
            className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Recommendations</option>
            <option value="HIGH">High Impact Only</option>
            <option value="MEDIUM">Medium Impact</option>
            <option value="LOW">Low Impact</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Active Recommendations
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {filteredRecommendations.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              of {totalRecommendations} total
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              High Impact
            </div>
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {highImpactCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              requiring attention
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Applied
            </div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {appliedCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              completed
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Potential Impact
            </div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              +{potentialImpact}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              conversions
            </div>
          </div>
        </div>

        {/* Priority Alert */}
        {highImpactCount > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-300 mb-1">
                  {highImpactCount} High-Impact Recommendations Waiting
                </h4>
                <p className="text-sm text-red-800 dark:text-red-400">
                  These recommendations could significantly improve your ROAS. Review and apply high-impact suggestions first for maximum results.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations List */}
        <div className="space-y-3">
          {filteredRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2 opacity-50" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {dismissedIds.size > 0 ? "All recommendations addressed!" : "No recommendations match this filter"}
              </p>
            </div>
          ) : (
            filteredRecommendations.map((rec) => (
              <div
                key={rec.id}
                className={`border rounded-lg p-4 transition-all ${getImpactColor(rec.impact)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl flex-shrink-0 mt-0.5">
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-base">
                          {rec.title}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getImpactBadgeColor(rec.impact)}`}>
                          {rec.impact === "HIGH" ? "⚡ High Impact" : rec.impact === "MEDIUM" ? "↑ Medium Impact" : "→ Low Impact"}
                        </span>
                      </div>

                      {/* Estimated Impact */}
                      {(rec.estimatedConversions || rec.estimatedClicks) && (
                        <div className="text-sm font-medium mb-2">
                          {rec.estimatedConversions && (
                            <span>
                              Estimated: <span className="text-emerald-600 dark:text-emerald-400">+{rec.estimatedConversions} conversions</span>/month
                            </span>
                          )}
                          {rec.estimatedClicks && (
                            <span>
                              Estimated: <span className="text-emerald-600 dark:text-emerald-400">+{rec.estimatedClicks} clicks</span>/month
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-sm opacity-90 mb-2">
                        {rec.description}
                      </p>

                      {/* Expandable Details */}
                      {expandedId === rec.id && (
                        <div className="mt-3 pt-3 border-t border-current border-opacity-20 text-sm opacity-90 space-y-2">
                          <div>
                            <strong>Recommendation Type:</strong> {rec.type.replace(/_/g, " ")}
                          </div>
                          <div>
                            <strong>Implementation:</strong> This recommendation can be {rec.applyable ? "automatically applied" : "manually implemented"} to your campaign.
                          </div>
                          <div>
                            <strong>Timeline:</strong> Changes typically take 24-48 hours to show impact in performance metrics.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === rec.id ? null : rec.id)
                      }
                      className="p-1.5 hover:opacity-70 transition-opacity"
                      aria-label="Toggle details"
                    >
                      {expandedId === rec.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {rec.applyable ? (
                    <Button
                      onClick={() => handleApply(rec.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs"
                      size="sm"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Apply Recommendation
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      className="text-xs opacity-50"
                      size="sm"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Manual Implementation Required
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDismiss(rec.id)}
                    variant="outline"
                    className="text-xs"
                    size="sm"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recommendations Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
            How to Maximize Recommendation Impact
          </h4>
          <ul className="text-sm space-y-2 text-blue-800 dark:text-blue-400">
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0">1.</span>
              <span>
                Prioritize high-impact recommendations that can be auto-applied to see results faster
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0">2.</span>
              <span>
                Test changes on small budgets first if you&apos;re unsure about the recommendation
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0">3.</span>
              <span>
                Monitor your dashboards for 48 hours after applying to measure actual impact
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold flex-shrink-0">4.</span>
              <span>
                Dismiss recommendations that don&apos;t align with your campaign strategy
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
