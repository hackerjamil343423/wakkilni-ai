import {
  DailyMetrics,
  KPIMetric,
  FunnelStage,
  FrequencyBucket,
  CreativePerformance,
  TrendChartData,
} from "./types";

// Helper to generate realistic variance
const variance = (base: number, percent: number = 0.15): number => {
  const delta = base * percent * (Math.random() * 2 - 1);
  return Math.max(0, base + delta);
};

// Generate last N days of data
export const generateDailyMetrics = (days: number = 30): DailyMetrics[] => {
  const data: DailyMetrics[] = [];
  const today = new Date();

  // Base metrics for a typical SaaS (targeting ~$50 CPA)
  let baseSpend = 850;
  let baseLeads = 18;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Add some weekly patterns (lower on weekends)
    const dayOfWeek = date.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;

    // Gradual growth trend
    const trendMultiplier = 1 + (days - i) * 0.005;

    const spend = variance(baseSpend * weekendMultiplier * trendMultiplier, 0.2);
    const impressions = Math.round(variance(spend * 85, 0.15));
    const clicks = Math.round(variance(impressions * 0.012, 0.2));
    const leads = Math.round(variance(baseLeads * weekendMultiplier * trendMultiplier, 0.25));
    const trials = Math.round(leads * variance(0.35, 0.15));
    const purchases = Math.round(trials * variance(0.28, 0.2));
    const revenue = purchases * variance(120, 0.1);

    data.push({
      date: date.toISOString().split('T')[0],
      spend: Math.round(spend * 100) / 100,
      impressions,
      clicks,
      leads,
      trials,
      purchases,
      revenue: Math.round(revenue * 100) / 100,
      roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0,
      cpa: leads > 0 ? Math.round((spend / leads) * 100) / 100 : 0,
      ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
    });
  }

  return data;
};

// Generate KPI metrics
export const generateKPIMetrics = (dailyData: DailyMetrics[]): KPIMetric[] => {
  const last7Days = dailyData.slice(-7);
  const prev7Days = dailyData.slice(-14, -7);

  const sumMetrics = (data: DailyMetrics[], key: keyof DailyMetrics) =>
    data.reduce((sum, d) => sum + (d[key] as number), 0);

  const avgMetrics = (data: DailyMetrics[], key: keyof DailyMetrics) =>
    sumMetrics(data, key) / data.length;

  // Calculate current and previous period metrics
  const currentSpend = sumMetrics(last7Days, 'spend');
  const prevSpend = sumMetrics(prev7Days, 'spend');
  const spendChange = prevSpend > 0 ? ((currentSpend - prevSpend) / prevSpend) * 100 : 0;

  const currentRevenue = sumMetrics(last7Days, 'revenue');
  const prevRevenue = sumMetrics(prev7Days, 'revenue');
  const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  const currentLeads = sumMetrics(last7Days, 'leads');
  const prevLeads = sumMetrics(prev7Days, 'leads');

  const currentCPA = currentLeads > 0 ? currentSpend / currentLeads : 0;
  const prevCPA = prevLeads > 0 ? prevSpend / prevLeads : 0;
  const cpaChange = prevCPA > 0 ? ((currentCPA - prevCPA) / prevCPA) * 100 : 0;

  const currentROAS = currentSpend > 0 ? currentRevenue / currentSpend : 0;
  const prevROAS = prevSpend > 0 ? prevRevenue / prevSpend : 0;
  const roasChange = prevROAS > 0 ? ((currentROAS - prevROAS) / prevROAS) * 100 : 0;

  return [
    {
      title: "Ad Spend",
      value: currentSpend,
      previousValue: prevSpend,
      change: Math.round(spendChange * 10) / 10,
      trend: spendChange >= 0 ? "up" : "down",
      format: "currency",
      sparklineData: last7Days.map(d => d.spend),
      isGood: spendChange <= 10 || revenueChange > spendChange,
    },
    {
      title: "Net New MRR",
      value: currentRevenue * 0.85, // Assuming 85% of revenue is MRR
      previousValue: prevRevenue * 0.85,
      change: Math.round(revenueChange * 10) / 10,
      trend: revenueChange >= 0 ? "up" : "down",
      format: "currency",
      sparklineData: last7Days.map(d => d.revenue * 0.85),
      isGood: revenueChange >= 0,
    },
    {
      title: "Blended CAC",
      value: currentCPA,
      previousValue: prevCPA,
      change: Math.round(cpaChange * 10) / 10,
      trend: cpaChange >= 0 ? "up" : "down",
      format: "currency",
      sparklineData: last7Days.map(d => d.cpa),
      isGood: currentCPA <= 50 && cpaChange <= 0,
    },
    {
      title: "ROAS",
      value: currentROAS,
      previousValue: prevROAS,
      change: Math.round(roasChange * 10) / 10,
      trend: roasChange >= 0 ? "up" : "down",
      format: "ratio",
      sparklineData: last7Days.map(d => d.roas),
      isGood: currentROAS >= 2 && roasChange >= 0,
    },
  ];
};

// Calculate KPI data for a specific metric
export const calculateKPIForMetric = (
  metricId: string,
  dailyData: DailyMetrics[],
  label: string
): KPIMetric | null => {
  const last7Days = dailyData.slice(-7);
  const prev7Days = dailyData.slice(-14, -7);

  const sumMetrics = (data: DailyMetrics[], key: keyof DailyMetrics) =>
    data.reduce((sum, d) => sum + (d[key] as number), 0);

  const avgMetrics = (data: DailyMetrics[], key: keyof DailyMetrics) =>
    data.length > 0 ? sumMetrics(data, key) / data.length : 0;

  // Calculate current and previous period values based on metric type
  let currentValue = 0;
  let prevValue = 0;
  let sparklineData: number[] = [];
  let format: "currency" | "percentage" | "number" | "ratio" = "number";
  let isGood = false;

  switch (metricId) {
    case "spend":
      currentValue = sumMetrics(last7Days, "spend");
      prevValue = sumMetrics(prev7Days, "spend");
      format = "currency";
      sparklineData = last7Days.map((d) => d.spend);
      isGood = currentValue <= prevValue || currentValue / prevValue < 1.1;
      break;

    case "impressions":
      currentValue = sumMetrics(last7Days, "impressions");
      prevValue = sumMetrics(prev7Days, "impressions");
      format = "number";
      sparklineData = last7Days.map((d) => d.impressions);
      isGood = currentValue > prevValue;
      break;

    case "clicks":
      currentValue = sumMetrics(last7Days, "clicks");
      prevValue = sumMetrics(prev7Days, "clicks");
      format = "number";
      sparklineData = last7Days.map((d) => d.clicks);
      isGood = currentValue > prevValue;
      break;

    case "leads":
      currentValue = sumMetrics(last7Days, "leads");
      prevValue = sumMetrics(prev7Days, "leads");
      format = "number";
      sparklineData = last7Days.map((d) => d.leads);
      isGood = currentValue > prevValue;
      break;

    case "trials":
      currentValue = sumMetrics(last7Days, "trials");
      prevValue = sumMetrics(prev7Days, "trials");
      format = "number";
      sparklineData = last7Days.map((d) => d.trials);
      isGood = currentValue > prevValue;
      break;

    case "purchases":
      currentValue = sumMetrics(last7Days, "purchases");
      prevValue = sumMetrics(prev7Days, "purchases");
      format = "number";
      sparklineData = last7Days.map((d) => d.purchases);
      isGood = currentValue > prevValue;
      break;

    case "revenue":
      currentValue = sumMetrics(last7Days, "revenue");
      prevValue = sumMetrics(prev7Days, "revenue");
      format = "currency";
      sparklineData = last7Days.map((d) => d.revenue);
      isGood = currentValue > prevValue;
      break;

    case "mrr":
      currentValue = sumMetrics(last7Days, "revenue") * 0.85;
      prevValue = sumMetrics(prev7Days, "revenue") * 0.85;
      format = "currency";
      sparklineData = last7Days.map((d) => d.revenue * 0.85);
      isGood = currentValue > prevValue;
      break;

    case "cpa":
      const currentLeads = sumMetrics(last7Days, "leads");
      const prevLeads = sumMetrics(prev7Days, "leads");
      const currentSpend = sumMetrics(last7Days, "spend");
      const prevSpend = sumMetrics(prev7Days, "spend");
      currentValue = currentLeads > 0 ? currentSpend / currentLeads : 0;
      prevValue = prevLeads > 0 ? prevSpend / prevLeads : 0;
      format = "currency";
      sparklineData = last7Days.map((d) => (d.leads > 0 ? d.spend / d.leads : 0));
      isGood = currentValue <= 50 && currentValue <= prevValue;
      break;

    case "cpc":
      const cpcClicks = sumMetrics(last7Days, "clicks");
      const cpcPrevClicks = sumMetrics(prev7Days, "clicks");
      const cpcSpend = sumMetrics(last7Days, "spend");
      const cpcPrevSpend = sumMetrics(prev7Days, "spend");
      currentValue = cpcClicks > 0 ? cpcSpend / cpcClicks : 0;
      prevValue = cpcPrevClicks > 0 ? cpcPrevSpend / cpcPrevClicks : 0;
      format = "currency";
      sparklineData = last7Days.map((d) =>
        d.clicks > 0 ? d.spend / d.clicks : 0
      );
      isGood = currentValue <= prevValue;
      break;

    case "ctr":
      currentValue = avgMetrics(last7Days, "ctr");
      prevValue = avgMetrics(prev7Days, "ctr");
      format = "percentage";
      sparklineData = last7Days.map((d) => d.ctr);
      isGood = currentValue > prevValue;
      break;

    case "roas":
      const roasRevenue = sumMetrics(last7Days, "revenue");
      const roasPrevRevenue = sumMetrics(prev7Days, "revenue");
      const roasSpend = sumMetrics(last7Days, "spend");
      const roasPrevSpend = sumMetrics(prev7Days, "spend");
      currentValue = roasSpend > 0 ? roasRevenue / roasSpend : 0;
      prevValue = roasPrevSpend > 0 ? roasPrevRevenue / roasPrevSpend : 0;
      format = "ratio";
      sparklineData = last7Days.map((d) => (d.spend > 0 ? d.revenue / d.spend : 0));
      isGood = currentValue >= 2 && currentValue >= prevValue;
      break;

    default:
      return null;
  }

  const change =
    prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : 0;

  return {
    title: label,
    value: currentValue,
    previousValue: prevValue,
    change: Math.round(change * 10) / 10,
    trend: change >= 0 ? "up" : "down",
    format,
    sparklineData,
    isGood,
  };
};

// Generate funnel data
export const generateFunnelData = (dailyData: DailyMetrics[]): FunnelStage[] => {
  const last7Days = dailyData.slice(-7);
  const prev7Days = dailyData.slice(-14, -7);

  const sumMetrics = (data: DailyMetrics[], key: keyof DailyMetrics) =>
    data.reduce((sum, d) => sum + (d[key] as number), 0);

  const currentImpressions = sumMetrics(last7Days, 'impressions');
  const currentClicks = sumMetrics(last7Days, 'clicks');
  const currentLandingPageViews = Math.round(currentClicks * 0.85);
  const currentLeads = sumMetrics(last7Days, 'leads');
  const currentPurchases = sumMetrics(last7Days, 'purchases');

  const prevImpressions = sumMetrics(prev7Days, 'impressions');
  const prevClicks = sumMetrics(prev7Days, 'clicks');
  const prevLandingPageViews = Math.round(prevClicks * 0.85);
  const prevLeads = sumMetrics(prev7Days, 'leads');
  const prevPurchases = sumMetrics(prev7Days, 'purchases');

  return [
    {
      stage: "Impressions",
      value: currentImpressions,
      previousValue: prevImpressions,
      dropoffRate: 0,
    },
    {
      stage: "Clicks",
      value: currentClicks,
      previousValue: prevClicks,
      dropoffRate: currentImpressions > 0
        ? Math.round((1 - currentClicks / currentImpressions) * 1000) / 10
        : 0,
    },
    {
      stage: "Page Views",
      value: currentLandingPageViews,
      previousValue: prevLandingPageViews,
      dropoffRate: currentClicks > 0
        ? Math.round((1 - currentLandingPageViews / currentClicks) * 1000) / 10
        : 0,
    },
    {
      stage: "Leads",
      value: currentLeads,
      previousValue: prevLeads,
      dropoffRate: currentLandingPageViews > 0
        ? Math.round((1 - currentLeads / currentLandingPageViews) * 1000) / 10
        : 0,
    },
    {
      stage: "Customers",
      value: currentPurchases,
      previousValue: prevPurchases,
      dropoffRate: currentLeads > 0
        ? Math.round((1 - currentPurchases / currentLeads) * 1000) / 10
        : 0,
    },
  ];
};

// Generate frequency bucket data
export const generateFrequencyData = (): FrequencyBucket[] => {
  return [
    { frequency: "1", reach: 45000, cpa: 42, spend: 8400, conversions: 200 },
    { frequency: "2", reach: 28000, cpa: 48, spend: 6240, conversions: 130 },
    { frequency: "3", reach: 18000, cpa: 55, spend: 4400, conversions: 80 },
    { frequency: "4", reach: 12000, cpa: 65, spend: 3250, conversions: 50 },
    { frequency: "5+", reach: 8000, cpa: 82, spend: 2460, conversions: 30 },
  ];
};

// Generate creative performance data
export const generateCreativeData = (): CreativePerformance[] => {
  const creatives = [
    { name: "UGC_Testimonial_Sarah", preview: "/api/placeholder/80/80" },
    { name: "Product_Demo_V2", preview: "/api/placeholder/80/80" },
    { name: "Pain_Point_Hook", preview: "/api/placeholder/80/80" },
    { name: "Before_After_Results", preview: "/api/placeholder/80/80" },
    { name: "Founder_Story", preview: "/api/placeholder/80/80" },
    { name: "Social_Proof_Carousel", preview: "/api/placeholder/80/80" },
    { name: "Feature_Highlight_AI", preview: "/api/placeholder/80/80" },
    { name: "Discount_Offer_Q4", preview: "/api/placeholder/80/80" },
  ];

  return creatives.map((c, i) => {
    // Base metrics
    const spend = variance(2500 - i * 200, 0.3);
    const impressions = Math.round(spend * variance(80, 0.2));
    const clicks = Math.round(impressions * variance(0.012, 0.3));
    const conversions = Math.round(variance(45 - i * 4, 0.25));

    // Derived engagement metrics
    const reach = Math.round(impressions * variance(0.85, 0.1));
    const frequency = reach > 0 ? Math.round((impressions / reach) * 100) / 100 : 0;
    const unique_clicks = Math.round(clicks * variance(0.9, 0.1));
    const link_clicks = Math.round(clicks * variance(0.95, 0.05));
    const post_engagement = Math.round(impressions * variance(0.02, 0.3));
    const page_engagement = Math.round(impressions * variance(0.015, 0.25));
    const engagement_rate = impressions > 0 ? (post_engagement / impressions) * 100 : 0;
    const ctr = clicks > 0 && impressions > 0 ? (clicks / impressions) * 100 : 0;

    // Video metrics
    const video_views = Math.round(impressions * variance(0.4, 0.2));
    const video_avg_time_watched = variance(15, 0.4); // seconds
    const video_p25_watched = Math.round(video_views * variance(0.85, 0.1));
    const video_p50_watched = Math.round(video_views * variance(0.65, 0.15));
    const video_p75_watched = Math.round(video_views * variance(0.45, 0.2));
    const video_p100_watched = Math.round(video_views * variance(0.3, 0.25));
    const thumbstop_ratio = video_views > 0 ? variance(0.45, 0.25) : 0;
    const video_completion_rate = video_views > 0 ? (video_p100_watched / video_views) * 100 : 0;

    // Conversion metrics
    const conversion_rate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const leads = Math.round(conversions * variance(0.7, 0.15));
    const purchases = Math.round(conversions * variance(0.3, 0.2));
    const revenue = purchases * variance(120, 0.25); // avg order value $80-160
    const cost_per_result = conversions > 0 ? Math.round((spend / conversions) * 100) / 100 : spend;

    // Cost metrics
    const cpm = impressions > 0 ? Math.round(((spend / impressions) * 1000) * 100) / 100 : 0;
    const cpc = clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0;
    const cpp = reach > 0 ? Math.round(((spend / reach) * 1000) * 100) / 100 : 0;
    const cpa = Math.round(variance(50 + i * 5, 0.2) * 100) / 100;
    const cost_per_conversion = cpa;

    // Quality metrics
    const hookRate = Math.round(variance(35 - i * 3, 0.2) * 10) / 10;
    const holdRate = Math.round(variance(45 - i * 2, 0.15) * 10) / 10;
    const quality_score = Math.round(variance(7 + i * 0.2, 0.15) * 10) / 10;
    const relevance_score = Math.round(variance(7.5 + i * 0.1, 0.1) * 10) / 10;
    const roas = spend > 0 ? Math.round((conversions * 120 / spend) * 100) / 100 : 0;

    return {
      // Basic
      id: `creative_${i + 1}`,
      name: c.name,
      preview: c.preview,
      status: i < 5 ? "ACTIVE" : i < 7 ? "TESTING" : "PAUSED" as const,
      impressions,
      reach,

      // Engagement
      clicks,
      unique_clicks,
      link_clicks,
      post_engagement,
      page_engagement,
      engagement_rate,
      frequency,
      ctr,

      // Video
      video_views,
      video_avg_time_watched,
      video_p25_watched,
      video_p50_watched,
      video_p75_watched,
      video_p100_watched,
      thumbstop_ratio,
      video_completion_rate,

      // Conversion
      conversions,
      conversion_rate,
      leads,
      purchases,
      revenue,
      cost_per_result,

      // Cost
      spend: Math.round(spend * 100) / 100,
      cpm,
      cpc,
      cpp,
      cpa,
      cost_per_conversion,

      // Quality
      hookRate,
      holdRate,
      quality_score,
      relevance_score,
      roas,
    };
  });
};

// Generate campaign data
export const generateCampaignData = () => {
  const campaigns = [
    { name: "Q4 Promotional Campaign" },
    { name: "Holiday Special 2024" },
    { name: "Spring Launch Campaign" },
    { name: "Retargeting Campaign" },
    { name: "Brand Awareness Drive" },
    { name: "Product Launch Q1" },
  ];

  return campaigns.map((c, i) => {
    const baseSpend = 5000 - i * 400;
    const spend = variance(baseSpend, 0.25);
    const impressions = Math.round(spend * variance(95, 0.2));
    const clicks = Math.round(impressions * variance(0.015, 0.25));
    const leads = Math.round(clicks * variance(0.08, 0.2));
    const conversions = Math.round(leads * variance(0.35, 0.2));
    const revenue = conversions * variance(125, 0.15);

    const reach = Math.round(impressions * variance(0.82, 0.12));
    const frequency = reach > 0 ? Math.round((impressions / reach) * 100) / 100 : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const cpa = leads > 0 ? spend / leads : 0;
    const roas = spend > 0 ? revenue / spend : 0;

    return {
      id: `campaign_${i + 1}`,
      name: c.name,
      preview: "/api/placeholder/80/80",
      status: i < 4 ? "ACTIVE" : "PAUSED",
      spend: Math.round(spend * 100) / 100,
      impressions,
      clicks,
      reach,
      frequency,
      leads,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      cpm: Math.round(cpm * 100) / 100,
      cpa: Math.round(cpa * 100) / 100,
      roas: Math.round(roas * 100) / 100,
    };
  });
};

// Generate trend chart data
export const generateTrendChartData = (dailyData: DailyMetrics[]): TrendChartData[] => {
  return dailyData.map(d => ({
    date: d.date,
    spend: d.spend,
    leads: d.leads,
    trials: d.trials,
    purchases: d.purchases,
  }));
};

// Format helpers
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Generate country performance data
export const generateCountryData = () => {
  const countries = [
    { name: "United States", flag: "🇺🇸", code: "US", color: "#3b82f6" },
    { name: "United Kingdom", flag: "🇬🇧", code: "GB", color: "#06b6d4" },
    { name: "Canada", flag: "🇨🇦", code: "CA", color: "#8b5cf6" },
    { name: "Australia", flag: "🇦🇺", code: "AU", color: "#ec4899" },
    { name: "Germany", flag: "🇩🇪", code: "DE", color: "#f59e0b" },
  ];

  return countries.map((c, i) => {
    const baseSpend = 15000 - i * 2000;
    const spend = variance(baseSpend, 0.2);
    const impressions = Math.round(spend * variance(90, 0.15));
    const clicks = Math.round(impressions * variance(0.013, 0.2));
    const conversions = Math.round(clicks * variance(0.08, 0.25));
    const revenue = conversions * variance(150, 0.15);

    const reach = Math.round(impressions * variance(0.8, 0.1));
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;
    const roas = spend > 0 ? revenue / spend : 0;
    const conversion_rate = clicks > 0 ? (conversions / clicks) * 100 : 0;

    return {
      id: `country_${i + 1}`,
      name: c.name,
      flag: c.flag,
      code: c.code,
      color: c.color,
      spend: Math.round(spend * 100) / 100,
      impressions,
      clicks,
      reach,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      cpa: Math.round(cpa * 100) / 100,
      roas: Math.round(roas * 100) / 100,
      conversion_rate: Math.round(conversion_rate * 100) / 100,
    };
  });
};
