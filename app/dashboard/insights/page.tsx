"use client";

import { PageHeader } from "@/components/patterns/page-header";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { InsightsOverview } from "./_components/insights-overview";
import { InsightsFeed } from "./_components/insights-feed";
import { OpportunityHeatmap } from "./_components/opportunity-heatmap";
import { ActionItems } from "./_components/action-items";
import {
  generateMockInsights,
  mockActionItems,
  mockOpportunityData,
} from "./mock-data";

export default function InsightsPage() {
  const insights = generateMockInsights(15);
  const insightsThisWeek = insights.filter(
    (insight) =>
      new Date().getTime() - insight.createdAt.getTime() <
      7 * 24 * 60 * 60 * 1000
  ).length;

  const pendingActions = mockActionItems.filter(
    (item) => item.status === "pending" || item.status === "in_progress"
  ).length;

  const averageImpactScore = Math.round(
    insights.reduce((sum, insight) => sum + insight.impactScore, 0) /
      insights.length
  );

  const handleRefresh = () => {
    // In production, this would trigger a data refresh
    window.location.reload();
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <PageHeader
        title="Smart Insights"
        description="AI-powered insights and recommendations across all your advertising platforms."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Smart Insights" },
        ]}
        action={
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Overview KPIs */}
      <InsightsOverview
        totalInsights={insights.length}
        pendingActions={pendingActions}
        impactScore={averageImpactScore}
        insightsThisWeek={insightsThisWeek}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights Feed - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <InsightsFeed insights={insights} />
        </div>

        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          <ActionItems items={mockActionItems} />
          <OpportunityHeatmap data={mockOpportunityData} />
        </div>
      </div>
    </div>
  );
}
