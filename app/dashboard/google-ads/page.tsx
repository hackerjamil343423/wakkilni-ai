"use client";

import { useState, useEffect } from "react";
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
import {
  generateDailyMetrics,
  generateCampaigns,
  generateAdGroups,
  generateKeywords,
  generateSearchTerms,
  generateAssetGroups,
  generateListingGroups,
  generateVideoMetrics,
  generateDemographics,
  generateGeoData,
  generateHourlyData,
  generateRecommendations,
  generateQualityScoreMatrix,
} from "./mock-data";
import {
  Campaign,
  AdGroup,
  Keyword,
  SearchTerm,
  AssetGroup,
  ListingGroup,
  VideoPerformance,
  DemographicPerformance,
  GeoPerformance,
  HourlyPerformance,
  QualityScoreDataPoint,
  Recommendation,
  DailyMetrics,
  DashboardFilters,
} from "./types";
import {
  BarChart3,
  Search,
  Zap,
  Video,
  Globe,
  Lightbulb,
} from "lucide-react";

type TabId = "overview" | "search" | "pmax" | "video" | "audience" | "recommendations";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: Tab[] = [
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3,
    description: "Account performance and trends",
  },
  {
    id: "search",
    label: "Search Intelligence",
    icon: Search,
    description: "Quality scores and search terms",
  },
  {
    id: "pmax",
    label: "Performance Max",
    icon: Zap,
    description: "Asset groups and listing performance",
  },
  {
    id: "video",
    label: "Video & Creative",
    icon: Video,
    description: "Video engagement and creative analysis",
  },
  {
    id: "audience",
    label: "Audience & Geo",
    icon: Globe,
    description: "Demographics, location, and day-parting",
  },
  {
    id: "recommendations",
    label: "Recommendations",
    icon: Lightbulb,
    description: "AI-powered optimization suggestions",
  },
];

export default function GoogleAdsDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    },
    campaignTypes: [],
    campaignStatuses: [],
  });

  // Mock Data State
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adGroups, setAdGroups] = useState<AdGroup[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([]);
  const [assetGroups, setAssetGroups] = useState<AssetGroup[]>([]);
  const [listingGroups, setListingGroups] = useState<ListingGroup[]>([]);
  const [videos, setVideos] = useState<VideoPerformance[]>([]);
  const [demographics, setDemographics] = useState<DemographicPerformance[]>([]);
  const [geoData, setGeoData] = useState<GeoPerformance[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyPerformance[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [qualityScoreMatrix, setQualityScoreMatrix] = useState<
    QualityScoreDataPoint[]
  >([]);

  // Initialize Data
  useEffect(() => {
    const initializeData = () => {
      setIsLoading(true);
      try {
        // Generate all mock data
        const daily = generateDailyMetrics(30);
        const camps = generateCampaigns(10);
        const adGrps = generateAdGroups(camps);
        const kws = generateKeywords(adGrps);
        const searchTermsList = generateSearchTerms(kws);
        const assetGrps = generateAssetGroups(camps);
        const listings = generateListingGroups(assetGrps);
        const videosData = generateVideoMetrics();
        const demosData = generateDemographics();
        const geoDataList = generateGeoData();
        const hourlyDataList = generateHourlyData();
        const recsData = generateRecommendations();
        const qualityMatrix = generateQualityScoreMatrix();

        // Set all states
        setDailyMetrics(daily);
        setCampaigns(camps);
        setAdGroups(adGrps);
        setKeywords(kws);
        setSearchTerms(searchTermsList);
        setAssetGroups(assetGrps);
        setListingGroups(listings);
        setVideos(videosData);
        setDemographics(demosData);
        setGeoData(geoDataList);
        setHourlyData(hourlyDataList);
        setRecommendations(recsData);
        setQualityScoreMatrix(qualityMatrix);
      } catch (error) {
        console.error("Error initializing dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Filter data based on current filters
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <DashboardHeader
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="flex overflow-x-auto" aria-label="Tabs">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                      ${
                        isActive
                          ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="text-left">
                      <div>{tab.label}</div>
                      <div className={`text-xs font-normal ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse h-32"
                  />
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
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <QualityScoreMatrix data={qualityScoreMatrix} />
                      <SearchTermMining data={searchTerms} />
                    </div>
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
                  <div className="space-y-6">
                    <VideoEngagementFunnel data={videos} />
                  </div>
                )}

                {/* Audience & Geo Tab */}
                {activeTab === "audience" && (
                  <div className="space-y-6">
                    <AudienceDemographics data={demographics} />
                    <GeoPerformanceMap data={geoData} />
                    <DaypartingHeatmap data={hourlyData} />
                  </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === "recommendations" && (
                  <div className="space-y-6">
                    <RecommendationsFeed data={recommendations} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
