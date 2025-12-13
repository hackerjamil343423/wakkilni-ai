/**
 * Column Configuration System for Meta Ads Dashboard
 * Defines all available metrics and their display properties
 */

export type ColumnCategory = 'basic' | 'engagement' | 'video' | 'conversion' | 'cost' | 'quality';
export type ColumnType = 'string' | 'number' | 'currency' | 'percentage' | 'badge' | 'time';

export interface ColumnConfig {
  id: string;
  label: string;
  category: ColumnCategory;
  type: ColumnType;
  sortable: boolean;
  defaultVisible: boolean;
  width: number;
  format?: (value: any) => string;
  description?: string;
}

export const COLUMN_CONFIG: Record<string, ColumnConfig> = {
  // Basic Metrics (5)
  preview: {
    id: 'preview',
    label: 'Preview',
    category: 'basic',
    type: 'string',
    sortable: false,
    defaultVisible: true,
    width: 60,
    description: 'Ad creative preview',
  },
  name: {
    id: 'name',
    label: 'Ad Name',
    category: 'basic',
    type: 'string',
    sortable: false,
    defaultVisible: true,
    width: 180,
    description: 'Creative name',
  },
  status: {
    id: 'status',
    label: 'Status',
    category: 'basic',
    type: 'badge',
    sortable: true,
    defaultVisible: true,
    width: 90,
    description: 'Campaign status',
  },
  impressions: {
    id: 'impressions',
    label: 'Impressions',
    category: 'basic',
    type: 'number',
    sortable: true,
    defaultVisible: true,
    width: 120,
    format: (value) => value.toLocaleString(),
    description: 'Total impressions',
  },
  reach: {
    id: 'reach',
    label: 'Reach',
    category: 'basic',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 100,
    format: (value) => value.toLocaleString(),
    description: 'Unique people reached',
  },

  // Engagement Metrics (7)
  clicks: {
    id: 'clicks',
    label: 'Clicks',
    category: 'engagement',
    type: 'number',
    sortable: true,
    defaultVisible: true,
    width: 100,
    format: (value) => value.toLocaleString(),
    description: 'Total clicks',
  },
  unique_clicks: {
    id: 'unique_clicks',
    label: 'Unique Clicks',
    category: 'engagement',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 120,
    format: (value) => value.toLocaleString(),
    description: 'Unique people who clicked',
  },
  link_clicks: {
    id: 'link_clicks',
    label: 'Link Clicks',
    category: 'engagement',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 110,
    format: (value) => value.toLocaleString(),
    description: 'Clicks on links',
  },
  post_engagement: {
    id: 'post_engagement',
    label: 'Post Engagement',
    category: 'engagement',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 130,
    format: (value) => value.toLocaleString(),
    description: 'Post likes, comments, shares',
  },
  page_engagement: {
    id: 'page_engagement',
    label: 'Page Engagement',
    category: 'engagement',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 130,
    format: (value) => value.toLocaleString(),
    description: 'Page interactions',
  },
  engagement_rate: {
    id: 'engagement_rate',
    label: 'Engagement Rate',
    category: 'engagement',
    type: 'percentage',
    sortable: true,
    defaultVisible: false,
    width: 130,
    format: (value) => `${value.toFixed(2)}%`,
    description: 'Engagement as % of impressions',
  },
  frequency: {
    id: 'frequency',
    label: 'Frequency',
    category: 'engagement',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 100,
    format: (value) => value.toFixed(2),
    description: 'Average times ad shown to each person',
  },
  ctr: {
    id: 'ctr',
    label: 'CTR',
    category: 'engagement',
    type: 'percentage',
    sortable: true,
    defaultVisible: true,
    width: 90,
    format: (value) => `${value.toFixed(2)}%`,
    description: 'Click-through rate',
  },

  // Video Metrics (8)
  video_views: {
    id: 'video_views',
    label: 'Video Views',
    category: 'video',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 110,
    format: (value) => value.toLocaleString(),
    description: 'Total video plays',
  },
  video_avg_time_watched: {
    id: 'video_avg_time_watched',
    label: 'Avg Watch Time',
    category: 'video',
    type: 'time',
    sortable: true,
    defaultVisible: false,
    width: 130,
    format: (value) => `${value.toFixed(1)}s`,
    description: 'Average video watch duration',
  },
  video_p25_watched: {
    id: 'video_p25_watched',
    label: 'Video 25%',
    category: 'video',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 100,
    format: (value) => value.toLocaleString(),
    description: 'Watched 25% of video',
  },
  video_p50_watched: {
    id: 'video_p50_watched',
    label: 'Video 50%',
    category: 'video',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 100,
    format: (value) => value.toLocaleString(),
    description: 'Watched 50% of video',
  },
  video_p75_watched: {
    id: 'video_p75_watched',
    label: 'Video 75%',
    category: 'video',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 100,
    format: (value) => value.toLocaleString(),
    description: 'Watched 75% of video',
  },
  video_p100_watched: {
    id: 'video_p100_watched',
    label: 'Video 100%',
    category: 'video',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 110,
    format: (value) => value.toLocaleString(),
    description: 'Watched entire video',
  },
  thumbstop_ratio: {
    id: 'thumbstop_ratio',
    label: 'Thumbstop Ratio',
    category: 'video',
    type: 'percentage',
    sortable: true,
    defaultVisible: false,
    width: 130,
    format: (value) => `${(value * 100).toFixed(1)}%`,
    description: 'Video stopped to view',
  },
  video_completion_rate: {
    id: 'video_completion_rate',
    label: 'Completion Rate',
    category: 'video',
    type: 'percentage',
    sortable: true,
    defaultVisible: false,
    width: 130,
    format: (value) => `${value.toFixed(1)}%`,
    description: 'Percentage watched to completion',
  },

  // Conversion Metrics (6)
  conversions: {
    id: 'conversions',
    label: 'Conversions',
    category: 'conversion',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 110,
    format: (value) => value.toLocaleString(),
    description: 'Total conversions',
  },
  conversion_rate: {
    id: 'conversion_rate',
    label: 'Conversion Rate',
    category: 'conversion',
    type: 'percentage',
    sortable: true,
    defaultVisible: false,
    width: 130,
    format: (value) => `${value.toFixed(2)}%`,
    description: 'Conversions as % of clicks',
  },
  leads: {
    id: 'leads',
    label: 'Leads',
    category: 'conversion',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 90,
    format: (value) => value.toLocaleString(),
    description: 'Total leads generated',
  },
  purchases: {
    id: 'purchases',
    label: 'Purchases',
    category: 'conversion',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 100,
    format: (value) => value.toLocaleString(),
    description: 'Total purchases',
  },
  revenue: {
    id: 'revenue',
    label: 'Revenue',
    category: 'conversion',
    type: 'currency',
    sortable: true,
    defaultVisible: false,
    width: 110,
    format: (value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    description: 'Total revenue generated',
  },
  cost_per_result: {
    id: 'cost_per_result',
    label: 'Cost/Result',
    category: 'conversion',
    type: 'currency',
    sortable: true,
    defaultVisible: false,
    width: 110,
    format: (value) => `$${value.toFixed(2)}`,
    description: 'Cost per conversion',
  },

  // Cost Metrics (6)
  spend: {
    id: 'spend',
    label: 'Spend',
    category: 'cost',
    type: 'currency',
    sortable: true,
    defaultVisible: true,
    width: 100,
    format: (value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    description: 'Total ad spend',
  },
  cpm: {
    id: 'cpm',
    label: 'CPM',
    category: 'cost',
    type: 'currency',
    sortable: true,
    defaultVisible: false,
    width: 90,
    format: (value) => `$${value.toFixed(2)}`,
    description: 'Cost per 1000 impressions',
  },
  cpc: {
    id: 'cpc',
    label: 'CPC',
    category: 'cost',
    type: 'currency',
    sortable: true,
    defaultVisible: false,
    width: 90,
    format: (value) => `$${value.toFixed(2)}`,
    description: 'Cost per click',
  },
  cpp: {
    id: 'cpp',
    label: 'CPP',
    category: 'cost',
    type: 'currency',
    sortable: true,
    defaultVisible: false,
    width: 90,
    format: (value) => `$${value.toFixed(2)}`,
    description: 'Cost per person reached',
  },
  cpa: {
    id: 'cpa',
    label: 'CPA',
    category: 'cost',
    type: 'currency',
    sortable: true,
    defaultVisible: true,
    width: 100,
    format: (value) => `$${value.toFixed(2)}`,
    description: 'Cost per acquisition',
  },
  cost_per_conversion: {
    id: 'cost_per_conversion',
    label: 'Cost/Conv',
    category: 'cost',
    type: 'currency',
    sortable: true,
    defaultVisible: false,
    width: 110,
    format: (value) => `$${value.toFixed(2)}`,
    description: 'Cost per conversion (same as CPA)',
  },

  // Quality Metrics (6)
  hookRate: {
    id: 'hookRate',
    label: 'Hook Rate',
    category: 'quality',
    type: 'percentage',
    sortable: true,
    defaultVisible: false,
    width: 100,
    format: (value) => `${value.toFixed(1)}%`,
    description: 'Video hook rate',
  },
  holdRate: {
    id: 'holdRate',
    label: 'Hold Rate',
    category: 'quality',
    type: 'percentage',
    sortable: true,
    defaultVisible: false,
    width: 100,
    format: (value) => `${value.toFixed(1)}%`,
    description: 'Video hold rate',
  },
  quality_score: {
    id: 'quality_score',
    label: 'Quality Score',
    category: 'quality',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 120,
    format: (value) => value.toFixed(1),
    description: 'Ad quality score (1-10)',
  },
  relevance_score: {
    id: 'relevance_score',
    label: 'Relevance Score',
    category: 'quality',
    type: 'number',
    sortable: true,
    defaultVisible: false,
    width: 130,
    format: (value) => value.toFixed(1),
    description: 'Ad relevance score (1-10)',
  },
  roas: {
    id: 'roas',
    label: 'ROAS',
    category: 'quality',
    type: 'number',
    sortable: true,
    defaultVisible: true,
    width: 90,
    format: (value) => `${value.toFixed(2)}x`,
    description: 'Return on ad spend',
  },
};

// Get all columns organized by category
export const getColumnsByCategory = (): Record<ColumnCategory, ColumnConfig[]> => {
  const categories: Record<ColumnCategory, ColumnConfig[]> = {
    basic: [],
    engagement: [],
    video: [],
    conversion: [],
    cost: [],
    quality: [],
  };

  Object.values(COLUMN_CONFIG).forEach((col) => {
    categories[col.category].push(col);
  });

  return categories;
};

// Get default visible columns
export const getDefaultColumns = (): string[] => {
  return Object.values(COLUMN_CONFIG)
    .filter((col) => col.defaultVisible)
    .map((col) => col.id);
};

// Get category label
export const getCategoryLabel = (category: ColumnCategory): string => {
  const labels: Record<ColumnCategory, string> = {
    basic: 'Basic Metrics',
    engagement: 'Engagement',
    video: 'Video Performance',
    conversion: 'Conversions',
    cost: 'Cost Metrics',
    quality: 'Quality & ROI',
  };
  return labels[category];
};

// Validate column IDs
export const isValidColumnId = (id: string): boolean => {
  return id in COLUMN_CONFIG;
};

// Get columns by IDs
export const getColumnsByIds = (ids: string[]): ColumnConfig[] => {
  return ids
    .filter(isValidColumnId)
    .map((id) => COLUMN_CONFIG[id]);
};
