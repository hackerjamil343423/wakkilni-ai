"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListingGroup } from "../types";
import { AlertTriangle, ShoppingCart, Eye, TrendingUp } from "lucide-react";

interface PMaxListingGroupsProps {
  data: ListingGroup[];
}

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

  const getStatusBadge = (listing: ListingGroup) => {
    if (listing.hasIssues) {
      if (listing.issueType === "DISAPPROVED") {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-3 w-3" /> Disapproved
          </span>
        );
      }
      if (listing.issueType === "MISSING_DATA") {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
            <Eye className="h-3 w-3" /> Missing Data
          </span>
        );
      }
    }

    if (zombieCount > 0 && listing.spend > 50 && listing.conversions === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
          🧟 Zombie Product
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
        ✓ Approved
      </span>
    );
  };

  const getRoasColor = (roas: number): string => {
    if (roas >= 3) return "text-emerald-600 dark:text-emerald-400";
    if (roas >= 2) return "text-blue-600 dark:text-blue-400";
    if (roas >= 1) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              PMax Listing Groups
            </CardTitle>
            <CardDescription>
              Product performance and issue tracking
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setFilterZombies(!filterZombies)}
              variant={filterZombies ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {filterZombies ? `Showing Zombies (${zombieCount})` : "Show Zombies"}
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              <option value="roas">Sort by ROAS</option>
              <option value="spend">Sort by Spend</option>
              <option value="conversions">Sort by Conversions</option>
              <option value="zombies">Show Zombies First</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Zombie Alert */}
        {zombieCount > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-1">
                  ⚠️ {zombieCount} Zombie Products Detected
                </h4>
                <p className="text-sm text-orange-800 dark:text-orange-400 mb-2">
                  These products have spent ${zombieSpend.toFixed(2)} but generated zero conversions. Consider excluding them or improving their assets.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                >
                  Bulk Exclude Zombies
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Total Products
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
              ${(data.reduce((sum, lg) => sum + lg.spend, 0) / 1000).toFixed(1)}k
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Total Conversions
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.reduce((sum, lg) => sum + lg.conversions, 0)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              Avg ROAS
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {(data.reduce((sum, lg) => sum + lg.roas, 0) / (data.length || 1)).toFixed(2)}x
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Product
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Impressions
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Clicks
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Spend
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Conversions
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  CPA
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((listing) => (
                <tr
                  key={listing.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                        {listing.productTitle}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {listing.productId}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(listing)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                    {listing.impressions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                    {listing.clicks.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                    ${listing.spend.toFixed(0)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                    {listing.conversions}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                    {listing.conversions > 0 ? `$${listing.cpa.toFixed(0)}` : "—"}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${getRoasColor(listing.roas)}`}>
                    {listing.roas.toFixed(2)}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Issues Summary */}
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Issues Summary
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                Disapproved
              </div>
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {data.filter((lg) => lg.issueType === "DISAPPROVED").length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                Missing Data
              </div>
              <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                {data.filter((lg) => lg.issueType === "MISSING_DATA").length}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                Zombie Products
              </div>
              <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {zombieCount}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
