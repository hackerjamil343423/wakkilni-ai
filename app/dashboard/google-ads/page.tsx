"use client";

import { useState, useEffect } from "react";
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
import { RecommendationsFeed } from "./_components/recommendations-feed";
import { AudienceDemographics } from "./_components/audience-demographics";
import { ConnectAccountPrompt } from "./_components/connect-account-prompt";
import { ConnectionStatus } from "./_components/connection-status";
import {
  useCampaigns,
  useDailyMetrics,
  useKeywords,
  useRecommendations,
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
import { DashboardFilters } from "./types";
import {
  BarChart3,
  Search,
  Zap,
  Video,
  Globe,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabId = "overview" | "search" | "pmax" | "video" | "audience" | "recommendations";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "search", label: "Search", icon: Search },
  { id: "pmax", label: "PMax", icon: Zap },
  { id: "video", label: "Video", icon: Video },
  { id: "audience", label: "Audience", icon: Globe },
  { id: "recommendations", label: "AI Insights", icon: Sparkles },
];

export default function GoogleAdsDashboard() {
  const router = useRouter();
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

  // Fetch data from API (only when connected and activeCustomerId is set)
  const {
    data: campaigns,
    loading: campaignsLoading,
    refetch: refetchCampaigns
  } = useCampaigns({
    customerId: activeCustomerId || "",
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    enabled: connected && !!activeCustomerId,
  });

  const {
    data: dailyMetrics,
    loading: metricsLoading,
    refetch: refetchMetrics
  } = useDailyMetrics({
    customerId: activeCustomerId || "",
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    enabled: connected && !!activeCustomerId,
  });

  const {
    data: keywords,
    loading: keywordsLoading,
    refetch: refetchKeywords
  } = useKeywords({
    customerId: activeCustomerId || "",
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    enabled: connected && !!activeCustomerId,
  });

  const {
    data: recommendations,
    loading: recommendationsLoading,
    refetch: refetchRecommendations,
    applyRecommendation
  } = useRecommendations(activeCustomerId || "", connected && !!activeCustomerId);

  const {
    data: geoData,
    loading: geoLoading,
    refetch: refetchGeo
  } = useGeoPerformance({
    customerId: activeCustomerId || "",
    startDate: filters.dateRange.startDate,
    endDate: filters.dateRange.endDate,
    enabled: connected && !!activeCustomerId,
  });

  // Generate mock data for features not yet implemented in API
  const [adGroups, setAdGroups] = useState<any[]>([]);
  const [searchTerms, setSearchTerms] = useState<any[]>([]);
  const [assetGroups, setAssetGroups] = useState<any[]>([]);
  const [listingGroups, setListingGroups] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [demographics, setDemographics] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [qualityScoreMatrix, setQualityScoreMatrix] = useState<any[]>([]);

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
    refetchMetrics();
    refetchKeywords();
    refetchRecommendations();
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

  const highImpactCount = recommendations.filter((r) => r.impact === "HIGH").length;

  const isLoading = campaignsLoading || metricsLoading;

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
            <h1 className="text-3xl font-bold">Google Ads Dashboard</h1>
            <ConnectionStatus
              connected={connected}
              customerId={activeCustomerId}
              onRefresh={handleRefresh}
            />
          </div>
          <DashboardHeader
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showBadge = tab.id === "recommendations" && highImpactCount > 0;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  isActive
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4",
                  tab.id === "recommendations" && "text-violet-500"
                )} />
                <span>{tab.label}</span>
                {showBadge && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                    {highImpactCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

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
                  <KPIScorecard campaigns={filteredCampaigns} keywords={keywords} />
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

              {/* Recommendations Tab */}
              {activeTab === "recommendations" && (
                <RecommendationsFeed
                  data={recommendations}
                  onApply={applyRecommendation}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
