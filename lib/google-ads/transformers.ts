/**
 * Data transformation utilities for Google Ads API responses
 * Converts Google Ads API format to our application's type system
 */

import {
  Campaign,
  AdGroup,
  Keyword,
  DailyMetrics,
  Recommendation,
  GeoPerformance,
  CampaignType,
  CampaignStatus,
  MatchType,
  QualityComponent,
} from "@/app/dashboard/google-ads/types";

/**
 * Convert micros to currency (divide by 1,000,000)
 */
const microsToValue = (micros: number): number => {
  return micros / 1_000_000;
};

/**
 * Convert decimal to percentage (multiply by 100)
 */
const decimalToPercentage = (decimal: number): number => {
  return decimal * 100;
};

/**
 * Map Google Ads campaign type to our enum
 */
const mapCampaignType = (type: string): CampaignType => {
  const typeMap: Record<string, CampaignType> = {
    SEARCH: "SEARCH",
    DISPLAY: "DISPLAY",
    VIDEO: "VIDEO",
    SHOPPING: "SHOPPING",
    PERFORMANCE_MAX: "PERFORMANCE_MAX",
    DEMAND_GEN: "DEMAND_GEN",
  };
  return typeMap[type] || "SEARCH";
};

/**
 * Map Google Ads status to our enum
 */
const mapStatus = (status: string): CampaignStatus => {
  const statusMap: Record<string, CampaignStatus> = {
    ENABLED: "ENABLED",
    PAUSED: "PAUSED",
    REMOVED: "REMOVED",
  };
  return statusMap[status] || "PAUSED";
};

/**
 * Map match type to our enum
 */
const mapMatchType = (matchType: string): MatchType => {
  const matchTypeMap: Record<string, MatchType> = {
    EXACT: "EXACT",
    PHRASE: "PHRASE",
    BROAD: "BROAD",
  };
  return matchTypeMap[matchType] || "BROAD";
};

/**
 * Map quality component to our enum
 */
const mapQualityComponent = (component: string): QualityComponent => {
  const componentMap: Record<string, QualityComponent> = {
    ABOVE_AVERAGE: "ABOVE_AVERAGE",
    AVERAGE: "AVERAGE",
    BELOW_AVERAGE: "BELOW_AVERAGE",
  };
  return componentMap[component] || "AVERAGE";
};

/**
 * Transform campaign data from Google Ads API
 */
export function transformCampaign(data: any): Campaign {
  const campaign = data.campaign;
  const metrics = data.metrics;
  const budget = data.campaign_budget;

  return {
    id: campaign.id.toString(),
    name: campaign.name,
    type: mapCampaignType(campaign.advertising_channel_type),
    status: mapStatus(campaign.status),
    budget: budget ? microsToValue(budget.amount_micros) : 0,
    spend: microsToValue(metrics.cost_micros || 0),
    impressions: parseInt(metrics.impressions || "0"),
    clicks: parseInt(metrics.clicks || "0"),
    conversions: parseFloat(metrics.conversions || "0"),
    conversionValue: microsToValue(metrics.conversions_value || 0),
    ctr: decimalToPercentage(metrics.ctr || 0),
    avgCpc: microsToValue(metrics.average_cpc || 0),
    cpa: microsToValue(metrics.cost_per_conversion || 0),
    roas: parseFloat(metrics.value_per_cost || "0"),
    searchImpressionShare: decimalToPercentage(metrics.search_impression_share || 0),
    searchLostIsRank: decimalToPercentage(metrics.search_rank_lost_impression_share || 0),
    searchLostIsBudget: decimalToPercentage(metrics.search_budget_lost_impression_share || 0),
  };
}

/**
 * Transform ad group data from Google Ads API
 */
export function transformAdGroup(data: any): AdGroup {
  const adGroup = data.ad_group;
  const metrics = data.metrics;
  const campaign = data.campaign;

  return {
    id: adGroup.id.toString(),
    campaignId: campaign.id.toString(),
    name: adGroup.name,
    status: mapStatus(adGroup.status),
    spend: microsToValue(metrics.cost_micros || 0),
    impressions: parseInt(metrics.impressions || "0"),
    clicks: parseInt(metrics.clicks || "0"),
    conversions: parseFloat(metrics.conversions || "0"),
    ctr: decimalToPercentage(metrics.ctr || 0),
    avgCpc: microsToValue(metrics.average_cpc || 0),
    cpa: microsToValue(metrics.cost_per_conversion || 0),
  };
}

/**
 * Transform keyword data from Google Ads API
 */
export function transformKeyword(data: any): Keyword {
  const criterion = data.ad_group_criterion;
  const metrics = data.metrics;
  const adGroup = data.ad_group;
  const qualityInfo = criterion.quality_info || {};

  return {
    id: criterion.criterion_id.toString(),
    adGroupId: adGroup.id.toString(),
    text: criterion.keyword.text,
    matchType: mapMatchType(criterion.keyword.match_type),
    status: mapStatus(criterion.status),
    qualityScore: parseInt(qualityInfo.quality_score || "5"),
    expectedCTR: mapQualityComponent(qualityInfo.search_predicted_ctr || "AVERAGE"),
    adRelevance: mapQualityComponent(qualityInfo.creative_quality_score || "AVERAGE"),
    landingPageExperience: mapQualityComponent(qualityInfo.post_click_quality_score || "AVERAGE"),
    spend: microsToValue(metrics.cost_micros || 0),
    impressions: parseInt(metrics.impressions || "0"),
    clicks: parseInt(metrics.clicks || "0"),
    conversions: parseFloat(metrics.conversions || "0"),
    ctr: decimalToPercentage(metrics.ctr || 0),
    avgCpc: microsToValue(metrics.average_cpc || 0),
    cpa: microsToValue(metrics.cost_per_conversion || 0),
  };
}

/**
 * Transform daily metrics data from Google Ads API
 */
export function transformMetrics(data: any): DailyMetrics {
  const segments = data.segments;
  const metrics = data.metrics;

  return {
    date: segments.date,
    spend: microsToValue(metrics.cost_micros || 0),
    impressions: parseInt(metrics.impressions || "0"),
    clicks: parseInt(metrics.clicks || "0"),
    conversions: parseFloat(metrics.conversions || "0"),
    conversionValue: microsToValue(metrics.conversions_value || 0),
    ctr: decimalToPercentage(metrics.ctr || 0),
    avgCpc: microsToValue(metrics.average_cpc || 0),
    cpa: microsToValue(metrics.cost_per_conversion || 0),
    roas: parseFloat(metrics.value_per_cost || "0"),
    searchImpressionShare: decimalToPercentage(metrics.search_impression_share || 0),
  };
}

/**
 * Transform recommendation data from Google Ads API
 */
export function transformRecommendation(data: any): Recommendation {
  const recommendation = data.recommendation;
  const impact = recommendation.impact?.base_metrics || {};

  // Map recommendation type to readable title and description
  const typeInfo = getRecommendationInfo(recommendation.type);

  return {
    id: recommendation.resource_name,
    type: recommendation.type,
    title: typeInfo.title,
    description: typeInfo.description,
    impact: determineImpact(impact),
    estimatedConversions: parseFloat(impact.conversions || "0"),
    estimatedClicks: parseInt(impact.clicks || "0"),
    applyable: isRecommendationApplyable(recommendation.type),
  };
}

/**
 * Transform geographic performance data from Google Ads API
 */
export function transformGeoPerformance(data: any): GeoPerformance {
  const geoView = data.geographic_view;
  const metrics = data.metrics;

  // Map country criterion ID to country code and name
  const { countryCode, countryName } = getCountryInfo(geoView.country_criterion_id);

  const spend = microsToValue(metrics.cost_micros || 0);
  const conversions = parseFloat(metrics.conversions || "0");

  return {
    countryCode,
    countryName,
    spend,
    impressions: parseInt(metrics.impressions || "0"),
    clicks: parseInt(metrics.clicks || "0"),
    conversions,
    roas: parseFloat(metrics.value_per_cost || "0"),
    ctr: decimalToPercentage(metrics.ctr || 0),
    cpa: conversions > 0 ? spend / conversions : 0,
  };
}

/**
 * Helper: Get recommendation info based on type
 */
function getRecommendationInfo(type: string): { title: string; description: string } {
  const infoMap: Record<string, { title: string; description: string }> = {
    CAMPAIGN_BUDGET_OPT_IN: {
      title: "Increase Campaign Budget",
      description: "Your campaign is limited by budget. Increasing budget could improve performance.",
    },
    TARGET_CPA_OPT_IN: {
      title: "Switch to Target CPA Bidding",
      description: "Automated bidding could help you get more conversions at your target cost per action.",
    },
    KEYWORD_MATCH_TYPE: {
      title: "Adjust Keyword Match Types",
      description: "Changing match types could help you reach more relevant searches.",
    },
    RESPONSIVE_SEARCH_AD_ADD: {
      title: "Add Responsive Search Ads",
      description: "Responsive search ads can improve ad performance through automated testing.",
    },
  };

  return infoMap[type] || {
    title: "Optimization Opportunity",
    description: "Google suggests this optimization to improve campaign performance.",
  };
}

/**
 * Helper: Determine recommendation impact level
 */
function determineImpact(metrics: any): "HIGH" | "MEDIUM" | "LOW" {
  const conversions = parseFloat(metrics.conversions || "0");

  if (conversions > 50) return "HIGH";
  if (conversions > 10) return "MEDIUM";
  return "LOW";
}

/**
 * Helper: Check if recommendation can be auto-applied
 */
function isRecommendationApplyable(type: string): boolean {
  const applyableTypes = [
    "CAMPAIGN_BUDGET_OPT_IN",
    "TARGET_CPA_OPT_IN",
    "KEYWORD_MATCH_TYPE",
  ];
  return applyableTypes.includes(type);
}

/**
 * Helper: Get country info from criterion ID
 * This is a simplified mapping - in production, use Google Ads geo target constants
 */
function getCountryInfo(criterionId: string): { countryCode: string; countryName: string } {
  // This is a sample mapping - you should use the full Google Ads geo target constants
  const geoMap: Record<string, { countryCode: string; countryName: string }> = {
    "2840": { countryCode: "US", countryName: "United States" },
    "2826": { countryCode: "GB", countryName: "United Kingdom" },
    "2124": { countryCode: "CA", countryName: "Canada" },
    "2036": { countryCode: "AU", countryName: "Australia" },
    "2276": { countryCode: "DE", countryName: "Germany" },
    "2250": { countryCode: "FR", countryName: "France" },
  };

  return geoMap[criterionId] || { countryCode: "UNKNOWN", countryName: "Unknown" };
}
