"use client";

import { useState, useMemo, useCallback, useEffect, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  // Critical data - generate immediately (above-the-fold content)
  const dailyMetrics = useMemo(
    () => generateDailyMetrics(30),
    [refreshKey]
  );

  const kpiMetrics = useMemo(
    () => generateKPIMetrics(dailyMetrics),
    [dailyMetrics]
  );

  const trendChartData = useMemo(
    () => generateTrendChartData(dailyMetrics),
    [dailyMetrics]
  );

  // Non-critical data - defer generation
  const [funnelData, setFunnelData] = useState<any>(null);
  const [frequencyData, setFrequencyData] = useState<any>(null);
  const [creativeData, setCreativeData] = useState<any>(null);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [countryData, setCountryData] = useState<any>(null);

  // Defer non-critical data generation
  useEffect(() => {
    startTransition(() => {
      // Use requestIdleCallback to generate data when browser is idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          setFunnelData(generateFunnelData(dailyMetrics));
          setFrequencyData(generateFrequencyData());
          setCreativeData(generateCreativeData());
          setCampaignData(generateCampaignData());
          setCountryData(generateCountryData());
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          setFunnelData(generateFunnelData(dailyMetrics));
          setFrequencyData(generateFrequencyData());
          setCreativeData(generateCreativeData());
          setCampaignData(generateCampaignData());
          setCountryData(generateCountryData());
        }, 0);
      }
    });
  }, [dailyMetrics, refreshKey]);

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
          {funnelData && <FunnelChart data={funnelData} />}
        </section>

        {/* Creative Performance Table */}
        {creativeData && (
          <section>
            <CreativeTable data={creativeData} />
          </section>
        )}

        {/* Audience Intelligence & Performance */}
        {(campaignData && creativeData && countryData) && (
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
