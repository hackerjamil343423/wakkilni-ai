export interface ChartMetricConfig {
  id: string;
  label: string;
  category: string;
  format: "currency" | "number" | "percentage" | "ratio";
  description: string;
  chartTypes: string[];
  dataKey: string;
  color?: string;
}

export const GOOGLE_ADS_METRICS: Record<string, ChartMetricConfig> = {
  // Cost Metrics
  spend: {
    id: "spend",
    label: "Ad Spend",
    category: "cost",
    format: "currency",
    description: "Total advertising spend",
    chartTypes: ["line", "bar", "area", "kpi"],
    dataKey: "spend",
    color: "#ea4335",
  },
  avg_cpc: {
    id: "avg_cpc",
    label: "Avg. CPC",
    category: "cost",
    format: "currency",
    description: "Average cost per click",
    chartTypes: ["line", "area", "kpi"],
    dataKey: "avgCpc",
    color: "#fbbc04",
  },

  // Impression Metrics
  impressions: {
    id: "impressions",
    label: "Impressions",
    category: "reach",
    format: "number",
    description: "Number of times ads were shown",
    chartTypes: ["line", "bar", "area", "kpi"],
    dataKey: "impressions",
    color: "#1a73e8",
  },
  search_impression_share: {
    id: "search_impression_share",
    label: "Search Impr. Share",
    category: "competitiveness",
    format: "percentage",
    description: "% of impressions you received vs. eligible",
    chartTypes: ["line", "area", "kpi"],
    dataKey: "searchImpressionShare",
    color: "#4285f4",
  },
  search_lost_is_rank: {
    id: "search_lost_is_rank",
    label: "Lost IS (Rank)",
    category: "competitiveness",
    format: "percentage",
    description: "% of impressions lost due to low Ad Rank",
    chartTypes: ["line", "area", "kpi"],
    dataKey: "searchLostIsRank",
    color: "#ea4335",
  },
  search_lost_is_budget: {
    id: "search_lost_is_budget",
    label: "Lost IS (Budget)",
    category: "competitiveness",
    format: "percentage",
    description: "% of impressions lost due to insufficient budget",
    chartTypes: ["line", "area", "kpi"],
    dataKey: "searchLostIsBudget",
    color: "#fbbc04",
  },

  // Click Metrics
  clicks: {
    id: "clicks",
    label: "Clicks",
    category: "engagement",
    format: "number",
    description: "Number of clicks on ads",
    chartTypes: ["line", "bar", "area", "kpi"],
    dataKey: "clicks",
    color: "#34a853",
  },
  ctr: {
    id: "ctr",
    label: "CTR",
    category: "engagement",
    format: "percentage",
    description: "Click-through rate",
    chartTypes: ["line", "area", "kpi"],
    dataKey: "ctr",
    color: "#34a853",
  },

  // Conversion Metrics
  conversions: {
    id: "conversions",
    label: "Conversions",
    category: "conversion",
    format: "number",
    description: "Total conversions",
    chartTypes: ["line", "bar", "area", "kpi"],
    dataKey: "conversions",
    color: "#34a853",
  },
  conversion_rate: {
    id: "conversion_rate",
    label: "Conv. Rate",
    category: "conversion",
    format: "percentage",
    description: "Conversions / Interactions",
    chartTypes: ["line", "area", "kpi"],
    dataKey: "conversionRate",
    color: "#34a853",
  },
  conversion_value: {
    id: "conversion_value",
    label: "Conv. Value",
    category: "conversion",
    format: "currency",
    description: "Total conversion value",
    chartTypes: ["line", "bar", "area", "kpi"],
    dataKey: "conversionValue",
    color: "#34a853",
  },
  cpa: {
    id: "cpa",
    label: "CPA",
    category: "efficiency",
    format: "currency",
    description: "Cost per acquisition",
    chartTypes: ["line", "area", "kpi"],
    dataKey: "cpa",
    color: "#ea4335",
  },
  roas: {
    id: "roas",
    label: "ROAS",
    category: "efficiency",
    format: "ratio",
    description: "Return on ad spend",
    chartTypes: ["line", "area", "kpi"],
    dataKey: "roas",
    color: "#34a853",
  },

  // Quality Metrics
  quality_score: {
    id: "quality_score",
    label: "Quality Score",
    category: "quality",
    format: "number",
    description: "Keyword quality score (1-10)",
    chartTypes: ["kpi", "scatter"],
    dataKey: "qualityScore",
    color: "#1a73e8",
  },

  // Video Metrics
  video_views: {
    id: "video_views",
    label: "Video Views",
    category: "engagement",
    format: "number",
    description: "Number of video views (30s+ or to end)",
    chartTypes: ["line", "bar", "area", "kpi"],
    dataKey: "views",
    color: "#1a73e8",
  },
  video_view_rate: {
    id: "video_view_rate",
    label: "View Rate",
    category: "engagement",
    format: "percentage",
    description: "Views / Impressions",
    chartTypes: ["line", "area", "kpi"],
    dataKey: "viewRate",
    color: "#1a73e8",
  },
  video_quartile_p25: {
    id: "video_quartile_p25",
    label: "25% Completion",
    category: "engagement",
    format: "percentage",
    description: "% of videos watched to 25%",
    chartTypes: ["funnel"],
    dataKey: "quartile25",
    color: "#4285f4",
  },
  video_quartile_p50: {
    id: "video_quartile_p50",
    label: "50% Completion",
    category: "engagement",
    format: "percentage",
    description: "% of videos watched to 50%",
    chartTypes: ["funnel"],
    dataKey: "quartile50",
    color: "#4285f4",
  },
  video_quartile_p75: {
    id: "video_quartile_p75",
    label: "75% Completion",
    category: "engagement",
    format: "percentage",
    description: "% of videos watched to 75%",
    chartTypes: ["funnel"],
    dataKey: "quartile75",
    color: "#4285f4",
  },
  video_quartile_p100: {
    id: "video_quartile_p100",
    label: "100% Completion",
    category: "engagement",
    format: "percentage",
    description: "% of videos watched to completion",
    chartTypes: ["funnel"],
    dataKey: "quartile100",
    color: "#4285f4",
  },
};

export const METRIC_CATEGORIES: Record<string, string[]> = {
  cost: ["spend", "avg_cpc"],
  reach: ["impressions"],
  competitiveness: ["search_impression_share", "search_lost_is_rank", "search_lost_is_budget"],
  engagement: ["clicks", "ctr", "video_views", "video_view_rate"],
  conversion: ["conversions", "conversion_rate", "conversion_value"],
  efficiency: ["cpa", "roas"],
  quality: ["quality_score"],
};

export const DEFAULT_CHART_METRICS = {
  overview: ["spend", "conversions"],
  topCampaigns: "roas",
  topCreatives: "conversions",
  searchCampaigns: "conversions",
  qualityScore: "quality_score",
  videoEngagement: "video_view_rate",
  demographics: "spend",
  geography: "roas",
  dayparting: "conversions",
};

export function formatMetricValue(value: number, format: string): string {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (format === "percentage") {
    return `${(value * 100).toFixed(2)}%`;
  }

  if (format === "ratio") {
    return `${value.toFixed(2)}x`;
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getMetricsForChartType(chartType: string): ChartMetricConfig[] {
  return Object.values(GOOGLE_ADS_METRICS).filter((metric) =>
    metric.chartTypes.includes(chartType)
  );
}

export function getMetricCategory(metricId: string): string | null {
  for (const [category, metrics] of Object.entries(METRIC_CATEGORIES)) {
    if (metrics.includes(metricId)) {
      return category;
    }
  }
  return null;
}
