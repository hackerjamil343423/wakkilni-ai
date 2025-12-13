"use client";

import { useState, useMemo, useCallback } from "react";
import { DashboardHeader } from "./_components/dashboard-header";
import { KPIGrid } from "./_components/kpi-grid";
import { MainChart } from "./_components/main-chart";
import { FunnelChart } from "./_components/funnel-chart";
import { CreativeTable } from "./_components/creative-table";
import { FrequencyChart } from "./_components/frequency-chart";
import { TopCreatives } from "./_components/top-creatives";
import { TopCampaigns } from "./_components/top-campaigns";
import { TopCountries } from "./_components/top-countries";
import {
  generateDailyMetrics,
  generateKPIMetrics,
  generateFunnelData,
  generateFrequencyData,
  generateCreativeData,
  generateCampaignData,
  generateTrendChartData,
  generateCountryData,
} from "./mock-data";

export default function MetaAdsDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Generate all data
  const dailyMetrics = useMemo(
    () => generateDailyMetrics(30),
    [refreshKey]
  );

  const kpiMetrics = useMemo(
    () => generateKPIMetrics(dailyMetrics),
    [dailyMetrics]
  );

  const funnelData = useMemo(
    () => generateFunnelData(dailyMetrics),
    [dailyMetrics]
  );

  const frequencyData = useMemo(
    () => generateFrequencyData(),
    [refreshKey]
  );

  const creativeData = useMemo(
    () => generateCreativeData(),
    [refreshKey]
  );

  const campaignData = useMemo(
    () => generateCampaignData(),
    [refreshKey]
  );

  const trendChartData = useMemo(
    () => generateTrendChartData(dailyMetrics),
    [dailyMetrics]
  );

  const countryData = useMemo(
    () => generateCountryData(),
    [refreshKey]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-4 lg:p-6 space-y-6 w-full">
        {/* Dashboard Header */}
        <DashboardHeader
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* KPI Cards */}
        <section>
          <KPIGrid dailyMetrics={dailyMetrics} metrics={kpiMetrics} />
        </section>

        {/* Main Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MainChart data={trendChartData} />
          <FunnelChart data={funnelData} />
        </section>

        {/* Creative Performance Table */}
        <section>
          <CreativeTable data={creativeData} />
        </section>

        {/* Audience Intelligence & Performance */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TopCampaigns data={campaignData} />
          <TopCreatives data={creativeData} />
          <TopCountries data={countryData} />
        </section>

        {/* Inline styles for animations */}
        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
