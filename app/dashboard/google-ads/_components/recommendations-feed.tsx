"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Recommendation } from "../types";
import {
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Target,
  DollarSign,
  Zap,
  Package,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationsFeedProps {
  data: Recommendation[];
}

const IMPACT_FILTERS = [
  { id: "all", label: "All" },
  { id: "HIGH", label: "High" },
  { id: "MEDIUM", label: "Medium" },
  { id: "LOW", label: "Low" },
] as const;

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
    alert(`Applied recommendation ${id}. In production, this would trigger the API call.`);
    handleDismiss(id);
  };

  const getRecommendationIcon = (type: string) => {
    if (type.includes("CPA") || type.includes("BIDDING")) return Target;
    if (type.includes("BUDGET")) return DollarSign;
    if (type.includes("KEYWORD")) return Zap;
    if (type.includes("PRODUCT") || type.includes("SHOPPING")) return Package;
    if (type.includes("AD") || type.includes("CREATIVE")) return CheckCircle;
    return Sparkles;
  };

  const highImpactCount = data.filter((r) => r.impact === "HIGH" && !dismissedIds.has(r.id)).length;
  const totalRecommendations = data.length;
  const appliedCount = dismissedIds.size;
  const potentialImpact = data
    .filter((r) => r.impact === "HIGH" && !dismissedIds.has(r.id))
    .reduce((sum, r) => sum + (r.estimatedConversions || r.estimatedClicks || 0), 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                AI Optimization Insights
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Intelligent suggestions to boost performance
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
          {IMPACT_FILTERS.map((filter) => {
            const isActive = filterImpact === filter.id;
            const count = filter.id === "all"
              ? filteredRecommendations.length
              : data.filter((r) => r.impact === filter.id && !dismissedIds.has(r.id)).length;

            return (
              <button
                key={filter.id}
                onClick={() => setFilterImpact(filter.id as typeof filterImpact)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  isActive
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                {filter.label}
                {count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold",
                    filter.id === "HIGH" && count > 0 ? "bg-red-500 text-white" : "bg-zinc-200 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800">
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Active</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{filteredRecommendations.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">High Priority</div>
          <div className={cn(
            "text-xl font-semibold tabular-nums",
            highImpactCount > 0 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-50"
          )}>
            {highImpactCount}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Applied</div>
          <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{appliedCount}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Potential</div>
          <div className="text-xl font-semibold text-violet-600 dark:text-violet-400 tabular-nums">+{potentialImpact}</div>
        </div>
      </div>

      {/* Priority Alert */}
      {highImpactCount > 0 && filterImpact === "all" && (
        <div className="mx-5 mt-5 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 dark:text-red-300 text-sm">
                {highImpactCount} High-Impact Opportunities
              </h4>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                These could significantly boost your ROAS. Review them first.
              </p>
            </div>
            <button
              onClick={() => setFilterImpact("HIGH")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              View
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      <div className="p-5 space-y-3">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3 opacity-60" />
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              {dismissedIds.size > 0 ? "All recommendations addressed!" : "No recommendations match this filter"}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
              Great job staying on top of optimizations
            </p>
          </div>
        ) : (
          filteredRecommendations.map((rec) => {
            const Icon = getRecommendationIcon(rec.type);
            const isExpanded = expandedId === rec.id;

            return (
              <div
                key={rec.id}
                className={cn(
                  "group relative border rounded-xl p-4 transition-all",
                  rec.impact === "HIGH"
                    ? "border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10"
                    : rec.impact === "MEDIUM"
                      ? "border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0",
                    rec.impact === "HIGH"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : rec.impact === "MEDIUM"
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-zinc-100 dark:bg-zinc-800"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      rec.impact === "HIGH"
                        ? "text-red-600 dark:text-red-400"
                        : rec.impact === "MEDIUM"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-zinc-600 dark:text-zinc-400"
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">
                        {rec.title}
                      </h4>
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0",
                        rec.impact === "HIGH"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                          : rec.impact === "MEDIUM"
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                      )}>
                        {rec.impact === "HIGH" && <Zap className="h-3 w-3" />}
                        {rec.impact}
                      </span>
                    </div>

                    {/* Estimated Impact */}
                    {(rec.estimatedConversions || rec.estimatedClicks) && (
                      <div className="flex items-center gap-1.5 text-xs mb-2">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                          +{rec.estimatedConversions || rec.estimatedClicks}
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {rec.estimatedConversions ? "conversions" : "clicks"}/month
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                      {rec.description}
                    </p>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <div><strong className="text-zinc-700 dark:text-zinc-300">Type:</strong> {rec.type.replace(/_/g, " ")}</div>
                        <div><strong className="text-zinc-700 dark:text-zinc-300">Implementation:</strong> {rec.applyable ? "Auto-apply available" : "Manual implementation required"}</div>
                        <div><strong className="text-zinc-700 dark:text-zinc-300">Timeline:</strong> Impact visible within 24-48 hours</div>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex items-center gap-2 mt-3">
                      {rec.applyable ? (
                        <Button
                          onClick={() => handleApply(rec.id)}
                          size="sm"
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Apply
                        </Button>
                      ) : (
                        <Button
                          disabled
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs opacity-50"
                        >
                          Manual Only
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDismiss(rec.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Dismiss
                      </Button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                        className="ml-auto flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        {isExpanded ? "Less" : "More"}
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
