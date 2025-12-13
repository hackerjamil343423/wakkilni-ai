"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "./_components/dashboard-header";
import { KPIScorecard } from "./_components/kpi-scorecard";
import { TrendAnalysisChart } from "./_components/trend-analysis-chart";
import { QualityScoreMatrix } from "./_components/quality-score-matrix";
import { SearchTermMining } from "./_components/search-term-mining";
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

export default function GoogleAdsDashboard() {
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

  // Calculate KPI values
  const totalSpend = filteredCampaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalConversions = filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalConversionValue = filteredCampaigns.reduce((sum, c) => sum + c.conversionValue, 0);
  const totalImpressions = filteredCampaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgQualityScore = (
    keywords.reduce((sum, k) => sum + k.qualityScore, 0) / keywords.length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <DashboardHeader
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />

        {/* KPI Scorecard */}
        {!isLoading && (
          <KPIScorecard campaigns={filteredCampaigns} keywords={keywords} />
        )}

        {/* Trend Analysis Chart */}
        {!isLoading && (
          <TrendAnalysisChart
            data={dailyMetrics}
            primaryMetric="spend"
            secondaryMetric="conversions"
          />
        )}

        {/* Search Intelligence Components */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Score Matrix */}
            <QualityScoreMatrix data={qualityScoreMatrix} />

            {/* Search Term Mining */}
            <div>
              <SearchTermMining data={searchTerms} />
            </div>
          </div>
        )}

        {/* Placeholder for Future Components */}
        {!isLoading && (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <h3 className="text-lg font-semibold mb-2">
                Phase 4 & Beyond - Coming Soon
              </h3>
              <p className="text-sm mb-4">
                The following components are ready for implementation:
              </p>
              <ul className="text-sm space-y-1 inline-block text-left">
                <li>✓ Trend Analysis Chart (Spend vs Conversions)</li>
                <li>✓ Quality Score Matrix (Scatter Plot)</li>
                <li>✓ Search Term Mining (Tree Map)</li>
                <li>→ Performance Max Asset Groups</li>
                <li>→ PMax Listing Groups</li>
                <li>→ Video Engagement Funnel</li>
                <li>→ Audience Demographics</li>
                <li>→ Geographic Performance Map</li>
                <li>→ Day-Parting Heatmap</li>
                <li>→ Recommendations Feed</li>
              </ul>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse h-32"
              />
            ))}
          </div>
        )}

        {/* Debug Info - Remove in Production */}
        {!isLoading && (
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400 font-mono">
            <div className="font-semibold mb-2">Data Summary:</div>
            <div>Campaigns: {filteredCampaigns.length}</div>
            <div>Ad Groups: {adGroups.length}</div>
            <div>Keywords: {keywords.length}</div>
            <div>Search Terms: {searchTerms.length}</div>
            <div>Asset Groups: {assetGroups.length}</div>
            <div>Listing Groups: {listingGroups.length}</div>
            <div>Videos: {videos.length}</div>
            <div>Recommendations: {recommendations.length}</div>
          </div>
        )}
      </div>
    </div>
  );
}
