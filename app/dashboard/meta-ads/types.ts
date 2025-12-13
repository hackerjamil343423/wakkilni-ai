// Meta Ads Dashboard Types
// Matching Meta Marketing API response shapes

export interface AdAccount {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  status: "ACTIVE" | "DISABLED" | "UNSETTLED";
}

export interface Campaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
  objective: "CONVERSIONS" | "LEAD_GENERATION" | "TRAFFIC" | "AWARENESS";
  dailyBudget: number;
  lifetimeBudget: number | null;
  startTime: string;
  endTime: string | null;
}

export interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED";
  targetingSpec: TargetingSpec;
  optimizationGoal: string;
  billingEvent: "IMPRESSIONS" | "CLICKS" | "ACTIONS";
  bidAmount: number | null;
}

export interface TargetingSpec {
  ageMin: number;
  ageMax: number;
  genders: number[];
  geoLocations: {
    countries: string[];
    regions?: string[];
    cities?: string[];
  };
  interests: string[];
  behaviors: string[];
  customAudiences: string[];
  lookalikeAudiences: string[];
}

export interface Ad {
  id: string;
  adSetId: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED";
  creative: AdCreative;
  previewUrl: string;
}

export interface AdCreative {
  id: string;
  name: string;
  title: string;
  body: string;
  callToAction: string;
  imageUrl: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  linkUrl: string;
}

// Metrics & Insights
export interface CampaignInsight {
  id: string;
  campaignId: string;
  campaignName: string;
  creativeName: string;
  creativePreview: string;
  date: string;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  uniqueClicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  spend: number;
  conversions: number;
  costPerConversion: number;
  leads: number;
  trials: number;
  purchases: number;
  revenue: number;
  roas: number;
  hookRate: number;
  holdRate: number;
  thumbstopRatio: number;
}

export interface DailyMetrics {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  trials: number;
  purchases: number;
  revenue: number;
  roas: number;
  cpa: number;
  ctr: number;
}

export interface KPIMetric {
  title: string;
  value: number;
  previousValue: number;
  change: number;
  trend: "up" | "down" | "neutral";
  format: "currency" | "percentage" | "number" | "ratio";
  sparklineData: number[];
  isGood: boolean;
}

export interface FunnelStage {
  stage: string;
  value: number;
  previousValue: number;
  dropoffRate: number;
}

export interface FrequencyBucket {
  frequency: string;
  reach: number;
  cpa: number;
  spend: number;
  conversions: number;
}

export interface CreativePerformance {
  // Basic Metrics
  id: string;
  name: string;
  preview: string;
  status: "ACTIVE" | "PAUSED" | "TESTING";
  impressions: number;
  reach: number;

  // Engagement Metrics
  clicks: number;
  unique_clicks: number;
  link_clicks: number;
  post_engagement: number;
  page_engagement: number;
  engagement_rate: number;
  frequency: number;
  ctr: number;

  // Video Metrics
  video_views: number;
  video_avg_time_watched: number;
  video_p25_watched: number;
  video_p50_watched: number;
  video_p75_watched: number;
  video_p100_watched: number;
  thumbstop_ratio: number;
  video_completion_rate: number;

  // Conversion Metrics
  conversions: number;
  conversion_rate: number;
  leads: number;
  purchases: number;
  revenue: number;
  cost_per_result: number;

  // Cost Metrics
  spend: number;
  cpm: number;
  cpc: number;
  cpp: number;
  cpa: number;
  cost_per_conversion: number;

  // Quality Metrics
  hookRate: number;
  holdRate: number;
  quality_score: number;
  relevance_score: number;
  roas: number;
}

// Filter Types
export interface DateRange {
  from: Date;
  to: Date;
}

export interface DashboardFilters {
  dateRange: DateRange;
  attribution: "1d_click" | "7d_click" | "28d_click" | "1d_view";
  campaigns: string[];
  adSets: string[];
}

// Chart Data Types
export interface TrendChartData {
  date: string;
  spend: number;
  leads: number;
  trials: number;
  purchases: number;
}

export type SecondaryMetric = "leads" | "trials" | "purchases";

export interface CountryPerformance {
  id: string;
  name: string;
  flag: string;
  code: string;
  color: string;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpa: number;
  roas: number;
  conversion_rate: number;
}
