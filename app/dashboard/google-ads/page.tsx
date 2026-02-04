"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "./_components/dashboard-header";
import { KPIScorecard } from "./_components/kpi-scorecard";
import { TrendAnalysisChart } from "./_components/trend-analysis-chart";
import { QualityScoreMatrix } from "./_components/quality-score-matrix";
import { SearchTermMining } from "./_components/search-term-mining";
import { PMaxAssetGroups } from "./_components/pmax-asset-groups";
import { PMaxListingGroups } from "./_components/pmax-listing-groups";
import { VideoEngagementFunnel } from "./_components/video-engagement-funnel";
import { GeoPerformanceMap } from "./_components/geo-performance-map";
import { DaypartingHeatmap } from "./_components/dayparting-heatmap";
import { AudienceDemographics } from "./_components/audience-demographics";
// ConnectAccountPrompt available for future use
import { ConnectionStatus } from "./_components/connection-status";
import {
  useCampaigns,
  useDailyMetrics,
  useKeywords,
  useGeoPerformance,
  useGoogleAdsConnection,
} from "@/lib/google-ads/hooks/useGoogleAds";
import {
  generateAdGroups,
  generateSearchTerms,
  generateAssetGroups,
  generateListingGroups,
  generateVideoMetrics,
  generateDemographics,
  generateHourlyData,
  generateQualityScoreMatrix,
} from "./mock-data";
import {
  DashboardFilters,
  AdGroup,
  SearchTerm,
  AssetGroup,
  ListingGroup,
  VideoPerformance,
  DemographicPerformance,
  HourlyPerformance,
  QualityScoreDataPoint,
} from "./types";
import { useTranslation } from "@/hooks/use-translation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabId = "overview" | "search" | "pmax" | "video" | "audience";

export default function GoogleAdsDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
    campaignTypes: [],
    campaignStatuses: [],
  });

  // Connection management
  const { connected, activeCustomerId, loading: connectionLoading } = useGoogleAdsConnection();

  // Calculate previous period date range (same duration, shifted back)
  const previousDateRange = useMemo(() => {
    const duration = filters.dateRange.endDate.getTime() - filters.dateRange.startDate.getTime();
    return {
      startDate: new Date(filters.dateRange.startDate.getTime() - duration),
      endDate: new Date(filters.dateRange.endDate.getTime() - duration),
    };
  }, [filters.dateRange]);

  // Fetch data from API (only when connected and activeCustomerId is set)
  const {
    data: campaigns,
    loading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns
  } = useCampaigns({
    customerId: activeCustomerId || "",
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    enabled: connected && !!activeCustomerId,
  });

  // Fetch previous period campaigns for comparison
  const {
    data: previousCampaigns,
    refetch: refetchPrevCampaigns
  } = useCampaigns({
    customerId: activeCustomerId || "",
    startDate: previousDateRange.startDate,
    endDate: previousDateRange.endDate,
    enabled: connected && !!activeCustomerId,
  });

  const {
    data: dailyMetrics,
    loading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useDailyMetrics({
    customerId: activeCustomerId || "",
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    enabled: connected && !!activeCustomerId,
  });

  const {
    data: keywords,
    error: keywordsError,
    refetch: refetchKeywords
  } = useKeywords({
    customerId: activeCustomerId || "",
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    enabled: connected && !!activeCustomerId,
  });

  // Fetch previous period keywords for comparison
  const {
    data: previousKeywords,
    refetch: refetchPrevKeywords
  } = useKeywords({
    customerId: activeCustomerId || "",
    startDate: previousDateRange.startDate,
    endDate: previousDateRange.endDate,
    enabled: connected && !!activeCustomerId,
  });

  const {
    data: geoData,
    error: geoError,
    refetch: refetchGeo
  } = useGeoPerformance({
    customerId: activeCustomerId || "",
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    enabled: connected && !!activeCustomerId,
  });

  // Generate mock data for features not yet implemented in API
  const [, setAdGroups] = useState<AdGroup[]>([]);
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([]);
  const [assetGroups, setAssetGroups] = useState<AssetGroup[]>([]);
  const [listingGroups, setListingGroups] = useState<ListingGroup[]>([]);
  const [videos, setVideos] = useState<VideoPerformance[]>([]);
  const [demographics, setDemographics] = useState<DemographicPerformance[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyPerformance[]>([]);
  const [qualityScoreMatrix, setQualityScoreMatrix] = useState<QualityScoreDataPoint[]>([]);

  // Generate supplementary mock data when we have real campaign data
  useEffect(() => {
    if (campaigns.length > 0) {
      const adGrps = generateAdGroups(campaigns);
      const kws = keywords.length > 0 ? keywords : [];
      const searchTermsList = generateSearchTerms(kws);
      const assetGrps = generateAssetGroups(campaigns);
      const listings = generateListingGroups(assetGrps);
      const videosData = generateVideoMetrics();
      const demosData = generateDemographics();
      const hourlyDataList = generateHourlyData();
      const qualityMatrix = generateQualityScoreMatrix();

      setAdGroups(adGrps);
      setSearchTerms(searchTermsList);
      setAssetGroups(assetGrps);
      setListingGroups(listings);
      setVideos(videosData);
      setDemographics(demosData);
      setHourlyData(hourlyDataList);
      setQualityScoreMatrix(qualityMatrix);
    }
  }, [campaigns, keywords]);

  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refetchCampaigns();
    refetchPrevCampaigns();
    refetchMetrics();
    refetchKeywords();
    refetchPrevKeywords();
    refetchGeo();
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (
      filters.campaignTypes.length > 0 &&
      !filters.campaignTypes.includes(campaign.type)
    ) {
      return false;
    }
    if (
      filters.campaignStatuses.length > 0 &&
      !filters.campaignStatuses.includes(campaign.status)
    ) {
      return false;
    }
    return true;
  });

  const isLoading = campaignsLoading || metricsLoading;

  // Aggregate errors from all hooks
  const apiError = campaignsError || metricsError || keywordsError || geoError;

  // Redirect to platform page if not connected (silent redirect, no white screen)
  useEffect(() => {
    if (!connectionLoading && !connected) {
      router.replace("/dashboard/connect-platform?source=google-ads");
    }
  }, [connectionLoading, connected, router]);

  // Show empty container while redirecting (prevents white flash)
  if (connectionLoading || !connected) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header with Connection Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{t("googleAds.dashboard.title")}</h1>
            <ConnectionStatus
              connected={connected}
              customerId={activeCustomerId}
              onRefresh={handleRefresh}
            />
          </div>
          <DashboardHeader
            onFiltersChange={handleFiltersChange}
            onTabChange={setActiveTab}
            currentTab={activeTab}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Error Banner */}
        {apiError && !isLoading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {apiError.message.includes("Failed to fetch")
                  ? "Unable to load data from Google Ads. Please check your connection and try again."
                  : apiError.message}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="ml-4 shrink-0"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 animate-pulse"
                >
                  <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-3" />
                  <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
                  <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <KPIScorecard
                    campaigns={filteredCampaigns}
                    previousCampaigns={previousCampaigns}
                    keywords={keywords}
                    previousKeywords={previousKeywords}
                  />
                  <TrendAnalysisChart
                    data={dailyMetrics}
                    primaryMetric="spend"
                    secondaryMetric="conversions"
                  />
                </div>
              )}

              {/* Search Intelligence Tab */}
              {activeTab === "search" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <QualityScoreMatrix data={qualityScoreMatrix} />
                  <SearchTermMining data={searchTerms} />
                </div>
              )}

              {/* Performance Max Tab */}
              {activeTab === "pmax" && (
                <div className="space-y-6">
                  <PMaxAssetGroups data={assetGroups} />
                  <PMaxListingGroups data={listingGroups} />
                </div>
              )}

              {/* Video & Creative Tab */}
              {activeTab === "video" && (
                <VideoEngagementFunnel data={videos} />
              )}

              {/* Audience & Geo Tab */}
              {activeTab === "audience" && (
                <div className="space-y-6">
                  <AudienceDemographics data={demographics} />
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <GeoPerformanceMap data={geoData} />
                    <DaypartingHeatmap data={hourlyData} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
