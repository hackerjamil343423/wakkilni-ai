"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ListingGroup } from "../types";
import { AlertTriangle, ShoppingCart, Eye, ChevronDown, Check, Skull, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PMaxListingGroupsProps {
  data: ListingGroup[];
}

const SORT_OPTIONS = [
  { id: "roas", label: "ROAS" },
  { id: "spend", label: "Spend" },
  { id: "conversions", label: "Conversions" },
  { id: "zombies", label: "Zombies First" },
] as const;

export function PMaxListingGroups({ data }: PMaxListingGroupsProps) {
  const [sortBy, setSortBy] = useState<"roas" | "spend" | "conversions" | "zombies">("roas");
  const [filterZombies, setFilterZombies] = useState(false);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (filterZombies) {
      filtered = filtered.filter((lg) => lg.spend > 50 && lg.conversions === 0);
    }

    return filtered.sort((a, b) => {
      if (sortBy === "zombies") {
        const aZombie = a.spend > 50 && a.conversions === 0 ? 1 : 0;
        const bZombie = b.spend > 50 && b.conversions === 0 ? 1 : 0;
        return bZombie - aZombie;
      }
      if (sortBy === "roas") return b.roas - a.roas;
      if (sortBy === "spend") return b.spend - a.spend;
      return b.conversions - a.conversions;
    });
  }, [data, sortBy, filterZombies]);

  const zombieProducts = data.filter((lg) => lg.spend > 50 && lg.conversions === 0);
  const zombieCount = zombieProducts.length;
  const zombieSpend = zombieProducts.reduce((sum, lg) => sum + lg.spend, 0);
  const totalSpend = data.reduce((sum, lg) => sum + lg.spend, 0);
  const totalConversions = data.reduce((sum, lg) => sum + lg.conversions, 0);
  const avgRoas = (data.reduce((sum, lg) => sum + lg.roas, 0) / (data.length || 1)).toFixed(2);

  const getStatusBadge = (listing: ListingGroup) => {
    if (listing.hasIssues) {
      if (listing.issueType === "DISAPPROVED") {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            <X className="h-3 w-3" /> Disapproved
          </span>
        );
      }
      if (listing.issueType === "MISSING_DATA") {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            <Eye className="h-3 w-3" /> Missing
          </span>
        );
      }
    }

    if (listing.spend > 50 && listing.conversions === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
          <Skull className="h-3 w-3" /> Zombie
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
        <Check className="h-3 w-3" /> Active
      </span>
    );
  };

  const getRoasColor = (roas: number): string => {
    if (roas >= 3) return "text-emerald-600 dark:text-emerald-400";
    if (roas >= 2) return "text-blue-600 dark:text-blue-400";
    if (roas >= 1) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                PMax Listing Groups
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Product performance and issue tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterZombies(!filterZombies)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                filterZombies
                  ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Skull className="h-3.5 w-3.5" />
              {filterZombies ? `Zombies (${zombieCount})` : "Zombies"}
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "roas" | "spend" | "conversions" | "zombies")}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium border-0 text-zinc-700 dark:text-zinc-300 cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-px bg-zinc-100 dark:bg-zinc-800">
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Products</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{data.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Spend</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">
            ${(totalSpend / 1000).toFixed(1)}k
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Conversions</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums">{totalConversions}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Avg ROAS</div>
          <div className={cn("text-xl font-semibold tabular-nums", getRoasColor(parseFloat(avgRoas)))}>{avgRoas}x</div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Zombie Alert */}
        {zombieCount > 0 && !filterZombies && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800/50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Skull className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 dark:text-orange-300 text-sm">
                  {zombieCount} Zombie Products Detected
                </h4>
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">
                  ${zombieSpend.toFixed(0)} spent with zero conversions
                </p>
              </div>
              <Button
                onClick={() => setFilterZombies(true)}
                size="sm"
                className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white"
              >
                Review
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-center py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Impr.
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Spend
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Conv.
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  CPA
                </th>
                <th className="text-right py-3 px-4 font-medium text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredData.map((listing) => (
                <tr
                  key={listing.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50 truncate max-w-xs text-sm">
                        {listing.productTitle}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                        {listing.productId}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(listing)}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums">
                    {listing.impressions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-600 dark:text-zinc-400 tabular-nums">
                    {listing.clicks.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-50 tabular-nums">
                    ${listing.spend.toFixed(0)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {listing.conversions}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {listing.conversions > 0 ? `$${listing.cpa.toFixed(0)}` : "—"}
                  </td>
                  <td className={cn("py-3 px-4 text-right font-bold tabular-nums", getRoasColor(listing.roas))}>
                    {listing.roas.toFixed(2)}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Issues Summary */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Issues Summary
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold tabular-nums">{data.filter((lg) => lg.issueType === "DISAPPROVED").length}</div>
              <div className="text-xs font-medium mt-1">Disapproved</div>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold tabular-nums">{data.filter((lg) => lg.issueType === "MISSING_DATA").length}</div>
              <div className="text-xs font-medium mt-1">Missing Data</div>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold tabular-nums">{zombieCount}</div>
              <div className="text-xs font-medium mt-1">Zombies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
