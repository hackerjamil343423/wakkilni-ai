/**
 * Google Ads Data Transformers
 * Transforms Google Ads API responses to dashboard type interfaces
 */

import type {
  Campaign,
  CampaignType,
  CampaignStatus,
  AdGroup,
  Keyword,
  MatchType,
  QualityComponent,
  GeoPerformance,
  DailyMetrics,
  DemographicPerformance,
} from "@/app/dashboard/google-ads/types";

/**
 * Converts micros to dollars
 * Google Ads API returns cost in micros (millionths)
 */
function microsToDecimal(micros: number): number {
  return micros / 1_000_000;
}

/**
 * Calculates Cost Per Acquisition
 */
function calculateCPA(cost: number, conversions: number): number {
  return conversions > 0 ? cost / conversions : 0;
}

/**
 * Calculates Return on Ad Spend
 */
function calculateROAS(conversionValue: number, cost: number): number {
  return cost > 0 ? conversionValue / cost : 0;
}

/**
 * Maps Google Ads campaign type to our CampaignType enum
 */
function mapCampaignType(googleType: string): CampaignType {
  const mapping: Record<string, CampaignType> = {
    SEARCH: "SEARCH",
    DISPLAY: "DISPLAY",
    VIDEO: "VIDEO",
    SHOPPING: "SHOPPING",
    PERFORMANCE_MAX: "PERFORMANCE_MAX",
    DEMAND_GEN: "DEMAND_GEN",
  };
  return mapping[googleType] || "SEARCH";
}

/**
 * Maps Google Ads status to our CampaignStatus enum
 */
function mapStatus(googleStatus: string): CampaignStatus {
  const mapping: Record<string, CampaignStatus> = {
    ENABLED: "ENABLED",
    PAUSED: "PAUSED",
    REMOVED: "REMOVED",
  };
  return mapping[googleStatus] || "PAUSED";
}

/**
 * Maps Google Ads match type to our MatchType enum
 */
function mapMatchType(googleMatchType: string): MatchType {
  const mapping: Record<string, MatchType> = {
    EXACT: "EXACT",
    PHRASE: "PHRASE",
    BROAD: "BROAD",
  };
  return mapping[googleMatchType] || "BROAD";
}

/**
 * Maps Google Ads quality score component to our QualityComponent enum
 */
function mapQualityComponent(googleComponent: string): QualityComponent {
  const mapping: Record<string, QualityComponent> = {
    ABOVE_AVERAGE: "ABOVE_AVERAGE",
    AVERAGE: "AVERAGE",
    BELOW_AVERAGE: "BELOW_AVERAGE",
  };
  return mapping[googleComponent] || "AVERAGE";
}

/**
 * Transforms Google Ads API daily metrics to DailyMetrics[]
 * @param googleAdsData - Raw data from Google Ads API
 * @returns Array of DailyMetrics
 */
export function transformDailyMetrics(googleAdsData: any[]): DailyMetrics[] {
  return googleAdsData.map((row) => {
    const metrics = row.metrics;
    const spend = microsToDecimal(metrics.cost_micros);
    const conversions = metrics.conversions || 0;
    const conversionValue = metrics.conversions_value || 0;

    return {
      date: row.segments.date, // Already in YYYY-MM-DD format
      spend,
      impressions: metrics.impressions || 0,
      clicks: metrics.clicks || 0,
      conversions,
      conversionValue,
      ctr: metrics.ctr || 0,
      avgCpc: microsToDecimal(metrics.average_cpc || 0),
      cpa: calculateCPA(spend, conversions),
      roas: calculateROAS(conversionValue, spend),
      qualityScore: 0, // Quality score is at keyword level, not daily
    };
  });
}

/**
 * Transforms Google Ads API campaigns to Campaign[]
 * @param googleAdsData - Raw campaign data from Google Ads API
 * @returns Array of Campaign objects
 */
export function transformCampaigns(googleAdsData: any[]): Campaign[] {
  return googleAdsData.map((row) => {
    const campaign = row.campaign;
    const metrics = row.metrics;
    const budget = row.campaign_budget;

    const spend = microsToDecimal(metrics.cost_micros || 0);
    const conversions = metrics.conversions || 0;
    const conversionValue = metrics.conversions_value || 0;

    return {
      id: campaign.id.toString(),
      name: campaign.name,
      type: mapCampaignType(campaign.advertising_channel_type),
      status: mapStatus(campaign.status),
      budget: microsToDecimal(budget?.amount_micros || 0),
      spend,
      impressions: metrics.impressions || 0,
      clicks: metrics.clicks || 0,
      conversions,
      conversionValue,
      ctr: metrics.ctr || 0,
      avgCpc: microsToDecimal(metrics.average_cpc || 0),
      cpa: calculateCPA(spend, conversions),
      roas: calculateROAS(conversionValue, spend),
      searchImpressionShare: metrics.search_impression_share,
      searchLostIsRank: metrics.search_lost_absolute_top_impression_share,
      searchLostIsBudget: metrics.search_budget_lost_impression_share,
    };
  });
}

/**
 * Transforms Google Ads API ad groups to AdGroup[]
 * @param googleAdsData - Raw ad group data from Google Ads API
 * @returns Array of AdGroup objects
 */
export function transformAdGroups(googleAdsData: any[]): AdGroup[] {
  return googleAdsData.map((row) => {
    const adGroup = row.ad_group;
    const metrics = row.metrics;

    const spend = microsToDecimal(metrics.cost_micros || 0);
    const conversions = metrics.conversions || 0;

    return {
      id: adGroup.id.toString(),
      campaignId: adGroup.campaign.split("/").pop()!, // Extract campaign ID from resource name
      name: adGroup.name,
      status: mapStatus(adGroup.status),
      spend,
      impressions: metrics.impressions || 0,
      clicks: metrics.clicks || 0,
      conversions,
      ctr: metrics.ctr || 0,
      avgCpc: microsToDecimal(metrics.average_cpc || 0),
      cpa: calculateCPA(spend, conversions),
    };
  });
}

/**
 * Transforms Google Ads API keywords to Keyword[]
 * @param googleAdsData - Raw keyword data from Google Ads API
 * @returns Array of Keyword objects
 */
export function transformKeywords(googleAdsData: any[]): Keyword[] {
  return googleAdsData.map((row) => {
    const keyword = row.ad_group_criterion;
    const metrics = row.metrics;

    const spend = microsToDecimal(metrics.cost_micros || 0);
    const conversions = metrics.conversions || 0;

    return {
      id: keyword.criterion_id.toString(),
      adGroupId: keyword.ad_group.split("/").pop()!, // Extract ad group ID from resource name
      text: keyword.keyword.text,
      matchType: mapMatchType(keyword.keyword.match_type),
      status: mapStatus(keyword.status),
      qualityScore: metrics.historical_quality_score || 0,
      expectedCTR: mapQualityComponent(
        metrics.historical_expected_ctr || "AVERAGE"
      ),
      adRelevance: mapQualityComponent(
        metrics.historical_ad_relevance || "AVERAGE"
      ),
      landingPageExperience: mapQualityComponent(
        metrics.historical_landing_page_quality_score || "AVERAGE"
      ),
      spend,
      impressions: metrics.impressions || 0,
      clicks: metrics.clicks || 0,
      conversions,
      ctr: metrics.ctr || 0,
      avgCpc: microsToDecimal(metrics.average_cpc || 0),
      cpa: calculateCPA(spend, conversions),
    };
  });
}

/**
 * Transforms Google Ads API geographic data to GeoPerformance[]
 * @param googleAdsData - Raw geo data from Google Ads API
 * @returns Array of GeoPerformance objects
 */
export function transformGeoData(googleAdsData: any[]): GeoPerformance[] {
  return googleAdsData.map((row) => {
    const geo = row.geographic_view;
    const metrics = row.metrics;

    const spend = microsToDecimal(metrics.cost_micros || 0);
    const conversions = metrics.conversions || 0;
    const conversionValue = metrics.conversions_value || 0;

    return {
      countryCode: geo.country_criterion_id.toString(),
      countryName: geo.location_type, // This will need to be mapped to country names
      spend,
      impressions: metrics.impressions || 0,
      clicks: metrics.clicks || 0,
      conversions,
      roas: calculateROAS(conversionValue, spend),
      ctr: metrics.ctr || 0,
      cpa: calculateCPA(spend, conversions),
    };
  });
}

/**
 * Transforms Google Ads API demographic data to DemographicPerformance[]
 * @param googleAdsData - Raw demographic data from Google Ads API
 * @returns Array of DemographicPerformance objects
 */
export function transformDemographics(
  googleAdsData: any[]
): DemographicPerformance[] {
  return googleAdsData.map((row) => {
    const demo = row.ad_group_criterion;
    const metrics = row.metrics;

    const spend = microsToDecimal(metrics.cost_micros || 0);
    const conversions = metrics.conversions || 0;
    const conversionValue = metrics.conversions_value || 0;
    const clicks = metrics.clicks || 0;
    const impressions = metrics.impressions || 0;

    return {
      age: demo.age_range?.type || "UNKNOWN",
      gender: demo.gender?.type,
      income: demo.income_range?.type,
      impressions,
      clicks,
      spend,
      conversions,
      cpa: calculateCPA(spend, conversions),
      conversionRate: impressions > 0 ? (conversions / impressions) * 100 : 0,
      roas: calculateROAS(conversionValue, spend),
    };
  });
}

/**
 * Country code to country name mapping
 * Commonly used countries in advertising
 */
export const COUNTRY_MAPPING: Record<string, string> = {
  "2840": "United States",
  "2826": "United Kingdom",
  "2124": "Canada",
  "2036": "Australia",
  "2276": "Germany",
  "2250": "France",
  "2380": "Italy",
  "2724": "Spain",
  "2528": "Netherlands",
  "2056": "Belgium",
  "2756": "Switzerland",
  "2040": "Austria",
  "2752": "Sweden",
  "2578": "Norway",
  "2208": "Denmark",
  "2246": "Finland",
  "2372": "Ireland",
  "2616": "Poland",
  "2203": "Czech Republic",
  "2348": "Hungary",
  "2642": "Romania",
  "2100": "Bulgaria",
  "2300": "Greece",
  "2620": "Portugal",
  "2703": "Slovakia",
  "2705": "Slovenia",
  "2233": "Estonia",
  "2428": "Latvia",
  "2440": "Lithuania",
  "2191": "Croatia",
  "2392": "Japan",
  "2410": "South Korea",
  "2702": "Singapore",
  "2344": "Hong Kong",
  "2158": "Taiwan",
  "2356": "India",
  "2764": "Thailand",
  "2458": "Malaysia",
  "2360": "Indonesia",
  "2608": "Philippines",
  "2704": "Vietnam",
  "2554": "New Zealand",
  "2076": "Brazil",
  "2484": "Mexico",
  "2032": "Argentina",
  "2152": "Chile",
  "2170": "Colombia",
  "2604": "Peru",
  "2218": "Ecuador",
  "2858": "Uruguay",
  "2710": "South Africa",
  "2784": "United Arab Emirates",
  "2682": "Saudi Arabia",
  "2818": "Egypt",
  "2376": "Israel",
  "2792": "Turkey",
};

/**
 * Maps country criterion ID to country name
 * @param criterionId - Google Ads country criterion ID
 * @returns Country name or "Unknown"
 */
export function getCountryName(criterionId: string): string {
  return COUNTRY_MAPPING[criterionId] || "Unknown";
}
