// TikTok Ads Data Schema & Mock Data Generator
// Reflects Real TikTok Ads API Structure

export interface TikTokRawMetrics {
  // Core Spend & Performance
  spend: number;
  impressions: number;
  cpm: number;
  cpc: number;
  conversions: number;
  cpa: number;

  // Video Engagement Metrics (The "North Star" for TikTok)
  video_watched_2s: number; // Hook metric
  video_watched_6s: number; // Hold metric
  video_views_p25: number;  // 25% completion
  video_views_p50: number;  // 50% completion
  video_views_p100: number; // 100% completion (finish rate)

  // Spark Ads Specific
  profile_visits: number;
  follows: number;

  // Attribution Split (iOS Privacy)
  skan_conversions: number; // SKAdNetwork conversions (iOS)
}

export interface TikTokDerivedMetrics {
  thumbstop_rate: number; // Hook Rate: (video_watched_2s / impressions) * 100
  retention_rate: number; // Hold Rate: (video_watched_6s / video_watched_2s) * 100
  finish_rate: number;    // (video_views_p100 / impressions) * 100
  roas: number;           // Return on Ad Spend
}

export interface TikTokCreative {
  id: string;
  filename: string;
  thumbnail_url?: string;
  is_spark_ad: boolean;
  metrics: TikTokRawMetrics;
  derived: TikTokDerivedMetrics;
}

export interface TikTokDemographic {
  gender: 'Female' | 'Male' | 'Unknown';
  age_group: '18-24' | '25-34' | '35-44' | '45+';
  impressions: number;
  spend: number;
  conversions: number;
  cpa: number;
}

export interface TikTokTimeSeriesData {
  date: string;
  spend: number;
  roas: number;
  cpa: number;
  thumbstop_rate: number;
}

export type DataSource = 'pixel' | 'skan';
export type Currency = 'USD' | 'EUR';

// Calculated Metrics Utilities
export function calculateThumbstopRate(
  video_watched_2s: number,
  impressions: number
): number {
  if (impressions === 0) return 0;
  return (video_watched_2s / impressions) * 100;
}

export function calculateRetentionRate(
  video_watched_6s: number,
  video_watched_2s: number
): number {
  if (video_watched_2s === 0) return 0;
  return (video_watched_6s / video_watched_2s) * 100;
}

export function calculateFinishRate(
  video_views_p100: number,
  impressions: number
): number {
  if (impressions === 0) return 0;
  return (video_views_p100 / impressions) * 100;
}

export function calculateROAS(conversions: number, spend: number, avgOrderValue: number = 50): number {
  if (spend === 0) return 0;
  return (conversions * avgOrderValue) / spend;
}

export function calculateDerivedMetrics(raw: TikTokRawMetrics): TikTokDerivedMetrics {
  return {
    thumbstop_rate: calculateThumbstopRate(raw.video_watched_2s, raw.impressions),
    retention_rate: calculateRetentionRate(raw.video_watched_6s, raw.video_watched_2s),
    finish_rate: calculateFinishRate(raw.video_views_p100, raw.impressions),
    roas: calculateROAS(raw.conversions, raw.spend),
  };
}

// Mock Data Generators
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateMockCreative(id: string, isSparkAd: boolean = false): TikTokCreative {
  const impressions = randomInt(10000, 500000);
  const video_watched_2s = Math.floor(impressions * randomFloat(0.15, 0.55)); // 15-55% hook rate
  const video_watched_6s = Math.floor(video_watched_2s * randomFloat(0.05, 0.35)); // 5-35% hold rate
  const video_views_p100 = Math.floor(impressions * randomFloat(0.01, 0.08)); // 1-8% finish rate
  const conversions = randomInt(50, 500);
  const spend = randomFloat(1000, 15000);

  const raw: TikTokRawMetrics = {
    spend,
    impressions,
    cpm: (spend / impressions) * 1000,
    cpc: spend / video_watched_2s,
    conversions,
    cpa: spend / conversions,
    video_watched_2s,
    video_watched_6s,
    video_views_p25: Math.floor(impressions * randomFloat(0.08, 0.20)),
    video_views_p50: Math.floor(impressions * randomFloat(0.04, 0.12)),
    video_views_p100,
    profile_visits: isSparkAd ? randomInt(100, 2000) : 0,
    follows: isSparkAd ? randomInt(20, 500) : 0,
    skan_conversions: Math.floor(conversions * randomFloat(0.3, 0.7)), // iOS split
  };

  return {
    id,
    filename: `creative_${id}_${isSparkAd ? 'spark' : 'standard'}.mp4`,
    is_spark_ad: isSparkAd,
    metrics: raw,
    derived: calculateDerivedMetrics(raw),
  };
}

export function generateMockCreatives(count: number): TikTokCreative[] {
  return Array.from({ length: count }, (_, i) => {
    const isSparkAd = Math.random() > 0.7; // 30% are Spark Ads
    return generateMockCreative(`ad_${i + 1}`, isSparkAd);
  });
}

export function generateMockDemographics(): TikTokDemographic[] {
  const genders: TikTokDemographic['gender'][] = ['Female', 'Male', 'Unknown'];
  const ageGroups: TikTokDemographic['age_group'][] = ['18-24', '25-34', '35-44', '45+'];
  const demographics: TikTokDemographic[] = [];

  genders.forEach((gender) => {
    ageGroups.forEach((age_group) => {
      const impressions = randomInt(5000, 100000);
      const spend = randomFloat(500, 8000);
      const conversions = randomInt(20, 300);
      demographics.push({
        gender,
        age_group,
        impressions,
        spend,
        conversions,
        cpa: spend / conversions,
      });
    });
  });

  return demographics;
}

export function generateMockTimeSeries(days: number): TikTokTimeSeriesData[] {
  const data: TikTokTimeSeriesData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      spend: randomFloat(2000, 8000),
      roas: randomFloat(1.5, 4.5),
      cpa: randomFloat(15, 45),
      thumbstop_rate: randomFloat(20, 50),
    });
  }

  return data;
}

// Aggregate metrics calculator
export function calculateAggregateMetrics(creatives: TikTokCreative[]) {
  const totals = creatives.reduce(
    (acc, creative) => {
      acc.spend += creative.metrics.spend;
      acc.impressions += creative.metrics.impressions;
      acc.conversions += creative.metrics.conversions;
      acc.video_watched_2s += creative.metrics.video_watched_2s;
      return acc;
    },
    { spend: 0, impressions: 0, conversions: 0, video_watched_2s: 0 }
  );

  return {
    total_spend: totals.spend,
    total_conversions: totals.conversions,
    avg_cpa: totals.spend / totals.conversions,
    avg_roas: calculateROAS(totals.conversions, totals.spend),
    avg_thumbstop_rate: calculateThumbstopRate(totals.video_watched_2s, totals.impressions),
  };
}
