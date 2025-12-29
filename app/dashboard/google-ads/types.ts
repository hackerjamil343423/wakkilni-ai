// Campaign Types
export type CampaignType =
  | "SEARCH"
  | "DISPLAY"
  | "VIDEO"
  | "SHOPPING"
  | "PERFORMANCE_MAX"
  | "DEMAND_GEN";

export type CampaignStatus = "ENABLED" | "PAUSED" | "REMOVED";

// Match Types
export type MatchType = "EXACT" | "PHRASE" | "BROAD";

// Quality Score Components
export type QualityComponent = "ABOVE_AVERAGE" | "AVERAGE" | "BELOW_AVERAGE";

// Ad Strength
export type AdStrength = "POOR" | "AVERAGE" | "GOOD" | "EXCELLENT";

// Recommendation Impact
export type RecommendationImpact = "HIGH" | "MEDIUM" | "LOW";

// Core Data Structures
export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  avgCpc: number;
  cpa: number;
  roas: number;
  searchImpressionShare?: number;
  searchLostIsRank?: number;
  searchLostIsBudget?: number;
}

export interface AdGroup {
  id: string;
  campaignId: string;
  name: string;
  status: CampaignStatus;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  avgCpc: number;
  cpa: number;
}

export interface Keyword {
  id: string;
  adGroupId: string;
  text: string;
  matchType: MatchType;
  status: CampaignStatus;
  qualityScore: number;
  expectedCTR: QualityComponent;
  adRelevance: QualityComponent;
  landingPageExperience: QualityComponent;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  avgCpc: number;
  cpa: number;
}

export interface SearchTerm {
  term: string;
  matchType: MatchType;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  roas: number;
  addedAsNegative: boolean;
}

export interface AssetGroup {
  id: string;
  campaignId: string;
  name: string;
  adStrength: AdStrength;
  status: CampaignStatus;
  spend: number;
  conversions: number;
  conversionValue: number;
  roas: number;
}

export interface ListingGroup {
  id: string;
  assetGroupId: string;
  productTitle: string;
  productId: string;
  status: CampaignStatus;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpa: number;
  roas: number;
  hasIssues: boolean;
  issueType?: "DISAPPROVED" | "MISSING_DATA" | "LOW_PERFORMANCE";
}

export interface VideoPerformance {
  videoId: string;
  title: string;
  thumbnail: string;
  impressions: number;
  views: number;
  quartile25: number;
  quartile50: number;
  quartile75: number;
  quartile100: number;
  viewRate: number;
  spend: number;
  conversions: number;
  conversionValue: number;
}

export interface DemographicPerformance {
  age: string;
  gender?: string;
  income?: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  cpa: number;
  conversionRate: number;
  roas: number;
}

export interface GeoPerformance {
  countryCode: string;
  countryName: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  ctr: number;
  cpa: number;
}

export interface HourlyPerformance {
  dayOfWeek: number;
  hour: number;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  cpa: number;
}

export interface KPIMetric {
  title: string;
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
  format: "currency" | "number" | "percentage" | "ratio";
  sparklineData: number[];
  isGood: boolean;
}

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: RecommendationImpact;
  estimatedConversions?: number;
  estimatedClicks?: number;
  estimatedSpendReduction?: number;
  applyable: boolean;
}

export interface DailyMetrics {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  avgCpc: number;
  cpa: number;
  roas: number;
  qualityScore?: number;
  searchImpressionShare?: number;
}

export interface QualityScoreDataPoint {
  keywordId: string;
  keyword: string;
  qualityScore: number;
  cpa: number;
  spend: number;
  expectedCTR: QualityComponent;
  adRelevance: QualityComponent;
  landingPageExperience: QualityComponent;
  status: CampaignStatus;
}

export interface DashboardFilters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  campaignTypes: CampaignType[];
  campaignStatuses: CampaignStatus[];
  networks?: string[];
  devices?: string[];
  matchTypes?: MatchType[];
}
