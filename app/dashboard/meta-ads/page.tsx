"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
  useMetaAdsConnection,
  useDailyMetrics,
  useCampaigns,
  useCreativePerformance,
  useFunnelData,
  useFrequencyAnalysis,
  useGeoPerformance,
} from "@/lib/meta-ads/hooks/useMetaAds";
import { generateKPIMetrics, generateTrendChartData } from "./mock-data";

export default function MetaAdsDashboard() {
  // Get active Meta Ads account
  const { accounts, activeAccountId, activeAccount, switchAccount, loading: connectionLoading } = useMetaAdsConnection();

  // Calculate date range (last 30 days)
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }, []);

  // Fetch daily metrics (critical data)
  const {
    data: dailyMetrics = [],
    loading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useDailyMetrics({
    accountId: activeAccountId ?? undefined,
    startDate,
    endDate,
    level: 'account',
    enabled: !!activeAccountId,
  });

  // Fetch campaigns
  const {
    data: campaignData = [],
    loading: campaignsLoading,
    refetch: refetchCampaigns,
  } = useCampaigns({
    accountId: activeAccountId ?? undefined,
    startDate,
    endDate,
    enabled: !!activeAccountId,
  });

  // Fetch creative performance
  const {
    data: creativeData = [],
    loading: creativesLoading,
    refetch: refetchCreatives,
  } = useCreativePerformance({
    accountId: activeAccountId ?? undefined,
    startDate,
    endDate,
    enabled: !!activeAccountId,
  });

  // Fetch funnel data
  const {
    data: funnelData = [],
    loading: funnelLoading,
    refetch: refetchFunnel,
  } = useFunnelData({
    accountId: activeAccountId ?? undefined,
    startDate,
    endDate,
    enabled: !!activeAccountId,
  });

  // Fetch frequency analysis
  const {
    data: frequencyData = [],
    loading: frequencyLoading,
    refetch: refetchFrequency,
  } = useFrequencyAnalysis({
    accountId: activeAccountId ?? undefined,
    startDate,
    endDate,
    enabled: !!activeAccountId,
  });

  // Fetch geographic performance
  const {
    data: countryData = [],
    loading: geoLoading,
    refetch: refetchGeo,
  } = useGeoPerformance({
    accountId: activeAccountId ?? undefined,
    startDate,
    endDate,
    breakdowns: ['country'],
    enabled: !!activeAccountId,
  });

  // Calculate KPI metrics from daily data
  const kpiMetrics = useMemo(
    () => generateKPIMetrics(dailyMetrics),
    [dailyMetrics]
  );

  // Generate trend chart data from daily metrics
  const trendChartData = useMemo(
    () => generateTrendChartData(dailyMetrics),
    [dailyMetrics]
  );

  // Combined loading state
  const isLoading = connectionLoading || metricsLoading;
  const isRefreshing = campaignsLoading || creativesLoading || funnelLoading || frequencyLoading || geoLoading;

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetchMetrics();
    refetchCampaigns();
    refetchCreatives();
    refetchFunnel();
    refetchFrequency();
    refetchGeo();
  }, [refetchMetrics, refetchCampaigns, refetchCreatives, refetchFunnel, refetchFrequency, refetchGeo]);

  // Show error state if metrics fail to load
  if (metricsError && !connectionLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to load Meta Ads data</h2>
          <p className="text-slate-600 mb-4">{metricsError.message}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show message if no account is connected
  if (!activeAccountId && !connectionLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Meta Ads account connected</h2>
          <p className="text-slate-600 mb-4">Connect your Meta Ads account to view your dashboard</p>
          <a
            href="/api/meta-ads/oauth/authorize"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect Meta Ads
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="p-4 lg:p-6 space-y-6 w-full">
        {/* Dashboard Header */}
        <DashboardHeader
          onRefresh={handleRefresh}
          isLoading={isLoading || isRefreshing}
          accounts={accounts}
          activeAccount={activeAccount}
          onAccountSwitch={switchAccount}
        />

        {/* KPI Cards */}
        <section>
          <KPIGrid dailyMetrics={dailyMetrics} metrics={kpiMetrics} />
        </section>

        {/* Main Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MainChart data={trendChartData} />
          {funnelData.length > 0 && <FunnelChart data={funnelData} />}
        </section>

        {/* Creative Performance Table */}
        {creativeData.length > 0 && (
          <section>
            <CreativeTable data={creativeData} />
          </section>
        )}

        {/* Audience Intelligence & Performance */}
        {(campaignData.length > 0 && creativeData.length > 0 && countryData.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TopCampaigns data={campaignData} />
            <TopCreatives data={creativeData} />
            <TopCountries data={countryData} />
          </section>
        )}

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
