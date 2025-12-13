/**
 * Chart Metrics Configuration
 * Centralized metric definitions for all dashboard charts
 */

export type ChartMetricCategory =
  | "acquisition"
  | "engagement"
  | "conversion"
  | "cost"
  | "performance";

export type ChartType = "line" | "bar" | "area" | "kpi" | "list";

export interface ChartMetricConfig {
  id: string;
  label: string;
  category: ChartMetricCategory;
  format: "number" | "currency" | "percentage" | "ratio";
  description: string;
  chartTypes: ChartType[];
  dataKey: string;
}

export const CHART_METRICS: Record<string, ChartMetricConfig> = {
  spend: {
    id: "spend",
    label: "Ad Spend",
    category: "cost",
    format: "currency",
    description: "Total advertising spend",
    chartTypes: ["line", "area", "kpi", "list"],
    dataKey: "spend",
  },
  impressions: {
    id: "impressions",
    label: "Impressions",
    category: "acquisition",
    format: "number",
    description: "Total ad impressions",
    chartTypes: ["line", "bar", "area", "kpi"],
    dataKey: "impressions",
  },
  clicks: {
    id: "clicks",
    label: "Clicks",
    category: "engagement",
    format: "number",
    description: "Total clicks",
    chartTypes: ["line", "bar", "kpi"],
    dataKey: "clicks",
  },
  leads: {
    id: "leads",
    label: "Leads",
    category: "conversion",
    format: "number",
    description: "Total leads generated",
    chartTypes: ["line", "bar", "area", "kpi"],
    dataKey: "leads",
  },
  trials: {
    id: "trials",
    label: "Free Trials",
    category: "conversion",
    format: "number",
    description: "Trial signups",
    chartTypes: ["line", "bar", "area", "kpi"],
    dataKey: "trials",
  },
  purchases: {
    id: "purchases",
    label: "Purchases",
    category: "conversion",
    format: "number",
    description: "Total purchases",
    chartTypes: ["line", "bar", "area", "kpi"],
    dataKey: "purchases",
  },
  conversions: {
    id: "conversions",
    label: "Conversions",
    category: "conversion",
    format: "number",
    description: "Total conversions",
    chartTypes: ["line", "bar", "kpi"],
    dataKey: "conversions",
  },
  revenue: {
    id: "revenue",
    label: "Revenue",
    category: "conversion",
    format: "currency",
    description: "Total revenue generated",
    chartTypes: ["line", "area", "kpi"],
    dataKey: "revenue",
  },
  mrr: {
    id: "mrr",
    label: "Net New MRR",
    category: "conversion",
    format: "currency",
    description: "Monthly recurring revenue",
    chartTypes: ["kpi"],
    dataKey: "revenue",
  },
  cpa: {
    id: "cpa",
    label: "CPA",
    category: "cost",
    format: "currency",
    description: "Cost per acquisition",
    chartTypes: ["line", "bar", "kpi", "list"],
    dataKey: "cpa",
  },
  cpc: {
    id: "cpc",
    label: "CPC",
    category: "cost",
    format: "currency",
    description: "Cost per click",
    chartTypes: ["line", "bar", "kpi"],
    dataKey: "cpc",
  },
  cpm: {
    id: "cpm",
    label: "CPM",
    category: "cost",
    format: "currency",
    description: "Cost per 1000 impressions",
    chartTypes: ["line", "bar", "kpi"],
    dataKey: "cpm",
  },
  ctr: {
    id: "ctr",
    label: "CTR",
    category: "performance",
    format: "percentage",
    description: "Click-through rate",
    chartTypes: ["line", "bar", "kpi", "list"],
    dataKey: "ctr",
  },
  roas: {
    id: "roas",
    label: "ROAS",
    category: "performance",
    format: "ratio",
    description: "Return on ad spend",
    chartTypes: ["line", "bar", "kpi", "list"],
    dataKey: "roas",
  },
  conversion_rate: {
    id: "conversion_rate",
    label: "Conversion Rate",
    category: "performance",
    format: "percentage",
    description: "Conversion rate (%)",
    chartTypes: ["line", "bar", "kpi"],
    dataKey: "conversion_rate",
  },
};

/**
 * Get metrics available for a specific chart type
 */
export const getMetricsForChartType = (
  chartType: ChartType
): ChartMetricConfig[] => {
  return Object.values(CHART_METRICS).filter((m) =>
    m.chartTypes.includes(chartType)
  );
};

/**
 * Get metrics grouped by category
 */
export const getMetricsByCategory = (): Record<
  ChartMetricCategory,
  ChartMetricConfig[]
> => {
  const categories: Record<ChartMetricCategory, ChartMetricConfig[]> = {
    acquisition: [],
    engagement: [],
    conversion: [],
    cost: [],
    performance: [],
  };

  Object.values(CHART_METRICS).forEach((metric) => {
    categories[metric.category].push(metric);
  });

  return categories;
};

/**
 * Default metric selections per chart
 */
export const DEFAULT_CHART_METRICS = {
  mainChartPrimary: "spend",
  mainChartSecondary: "leads",
  topCreatives: "roas",
  frequencyChart: ["reach", "cpa"],
  kpiGrid: ["spend", "impressions", "clicks", "leads", "revenue", "mrr", "cpa", "roas"],
};

/**
 * Format metric value based on format type
 */
export const formatMetricValue = (
  value: number,
  format: ChartMetricConfig["format"]
): string => {
  switch (format) {
    case "currency":
      return `$${value.toLocaleString("en-US", {
        maximumFractionDigits: 0,
      })}`;
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "ratio":
      return `${value.toFixed(2)}x`;
    case "number":
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toString();
  }
};

/**
 * Get category label for UI display
 */
export const getCategoryLabel = (category: ChartMetricCategory): string => {
  const labels: Record<ChartMetricCategory, string> = {
    acquisition: "Acquisition",
    engagement: "Engagement",
    conversion: "Conversions",
    cost: "Cost Metrics",
    performance: "Performance",
  };
  return labels[category];
};
