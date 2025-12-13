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
  CampaignType,
  CampaignStatus,
  MatchType,
  QualityComponent,
  AdStrength,
} from "./types";

// Helper Functions
function addVariance(base: number, variance: number = 0.2): number {
  return base * (1 + (Math.random() - 0.5) * variance);
}

function getWeekendMultiplier(date: Date, campaignType: CampaignType): number {
  const isWeekend = [0, 6].includes(date.getDay());
  if (campaignType === "SEARCH") return isWeekend ? 0.8 : 1;
  if (campaignType === "SHOPPING") return isWeekend ? 1.2 : 1;
  if (campaignType === "DISPLAY") return isWeekend ? 0.9 : 1;
  return 1;
}

function calculateQualityScore(
  expectedCTR: QualityComponent,
  adRelevance: QualityComponent,
  landingPage: QualityComponent
): number {
  const componentScores = {
    "ABOVE_AVERAGE": 3,
    "AVERAGE": 2,
    "BELOW_AVERAGE": 1,
  };

  const avg =
    (componentScores[expectedCTR] +
      componentScores[adRelevance] +
      componentScores[landingPage]) /
    3;

  return Math.round(avg * 3) + Math.floor(Math.random() * 2);
}

// Mock Data Generators
export function generateDailyMetrics(days: number = 30): DailyMetrics[] {
  const metrics: DailyMetrics[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const baseSpend = 5000 + Math.random() * 5000;
    const spend = addVariance(baseSpend, 0.3);
    const impressions = Math.round(addVariance(80000, 0.25));
    const clicks = Math.round(impressions * (0.02 + Math.random() * 0.03));
    const conversions = Math.round(clicks * (0.03 + Math.random() * 0.04));
    const conversionValue = conversions * (50 + Math.random() * 100);

    metrics.push({
      date: date.toISOString().split("T")[0],
      spend,
      impressions,
      clicks,
      conversions,
      conversionValue,
      ctr: clicks / impressions,
      avgCpc: spend / clicks,
      cpa: spend / conversions,
      roas: conversionValue / spend,
      qualityScore: 6 + Math.random() * 4,
    });
  }

  return metrics;
}

export function generateCampaigns(count: number = 10): Campaign[] {
  const campaignTypes: CampaignType[] = [
    "SEARCH",
    "SEARCH",
    "SEARCH",
    "SEARCH",
    "PERFORMANCE_MAX",
    "PERFORMANCE_MAX",
    "PERFORMANCE_MAX",
    "DISPLAY",
    "DISPLAY",
    "VIDEO",
  ];

  const campaigns: Campaign[] = [];

  for (let i = 0; i < count; i++) {
    const type = campaignTypes[i % campaignTypes.length];
    const budget = (1000 + Math.random() * 9000) * (type === "PERFORMANCE_MAX" ? 1.5 : 1);
    const spend = budget * (0.6 + Math.random() * 0.4);
    const impressions = Math.round(80000 + Math.random() * 100000);
    const clicks = Math.round(impressions * (0.01 + Math.random() * 0.05));
    const conversions = Math.round(clicks * (0.02 + Math.random() * 0.06));
    const conversionValue = conversions * (50 + Math.random() * 150);

    campaigns.push({
      id: `campaign_${i + 1}`,
      name: `${type === "SEARCH" ? "Search" : type === "PERFORMANCE_MAX" ? "PMax" : type === "DISPLAY" ? "Display" : "Video"} Campaign ${i + 1}`,
      type,
      status: Math.random() > 0.2 ? "ENABLED" : Math.random() > 0.5 ? "PAUSED" : "REMOVED",
      budget,
      spend,
      impressions,
      clicks,
      conversions,
      conversionValue,
      ctr: clicks / impressions,
      avgCpc: spend / clicks,
      cpa: spend / conversions,
      roas: conversionValue / spend,
      searchImpressionShare: type === "SEARCH" ? 0.4 + Math.random() * 0.6 : undefined,
      searchLostIsRank: type === "SEARCH" ? Math.random() * 0.4 : undefined,
      searchLostIsBudget: type === "SEARCH" ? Math.random() * 0.2 : undefined,
    });
  }

  return campaigns;
}

export function generateAdGroups(campaigns: Campaign[]): AdGroup[] {
  const adGroups: AdGroup[] = [];

  campaigns.forEach((campaign, campIndex) => {
    const adGroupCount = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < adGroupCount; i++) {
      const spend = campaign.spend * (0.5 / adGroupCount + Math.random() * 0.5 / adGroupCount);
      const impressions = Math.round(campaign.impressions * (0.5 / adGroupCount + Math.random() * 0.5 / adGroupCount));
      const clicks = Math.round(impressions * (campaign.clicks / campaign.impressions) * (0.8 + Math.random() * 0.4));
      const conversions = Math.round(clicks * (campaign.conversions / campaign.clicks) * (0.8 + Math.random() * 0.4));

      adGroups.push({
        id: `ad_group_${campIndex}_${i}`,
        campaignId: campaign.id,
        name: `Ad Group ${i + 1}`,
        status: campaign.status,
        spend,
        impressions,
        clicks,
        conversions,
        ctr: clicks / impressions,
        avgCpc: spend / clicks,
        cpa: spend / conversions,
      });
    }
  });

  return adGroups;
}

export function generateKeywords(adGroups: AdGroup[]): Keyword[] {
  const keywords: Keyword[] = [];
  const keywordSamples = [
    "best running shoes",
    "cheap flights",
    "web design services",
    "digital marketing",
    "software development",
    "mobile app creation",
    "seo services",
    "social media marketing",
    "content marketing strategy",
    "email marketing platform",
  ];

  adGroups.forEach((adGroup, adGroupIndex) => {
    const keywordCount = 5 + Math.floor(Math.random() * 15);

    for (let i = 0; i < keywordCount; i++) {
      const matchTypes: MatchType[] = ["BROAD", "PHRASE", "EXACT"];
      const matchType = matchTypes[Math.floor(Math.random() * 3)];

      const expectedCTRValues: QualityComponent[] = ["ABOVE_AVERAGE", "AVERAGE", "BELOW_AVERAGE"];
      const expectedCTR = expectedCTRValues[Math.floor(Math.random() * 3)];

      const adRelevanceValues: QualityComponent[] = ["ABOVE_AVERAGE", "AVERAGE", "BELOW_AVERAGE"];
      const adRelevance = adRelevanceValues[Math.floor(Math.random() * 3)];

      const landingPageValues: QualityComponent[] = ["ABOVE_AVERAGE", "AVERAGE", "BELOW_AVERAGE"];
      const landingPage = landingPageValues[Math.floor(Math.random() * 3)];

      const qualityScore = calculateQualityScore(expectedCTR, adRelevance, landingPage);

      const spend = adGroup.spend * (0.5 / keywordCount + Math.random() * 0.5 / keywordCount);
      const impressions = Math.round(
        adGroup.impressions * (0.5 / keywordCount + Math.random() * 0.5 / keywordCount)
      );
      const clicks = Math.round(impressions * (0.01 + Math.random() * 0.05));
      const conversions = Math.round(clicks * (0.02 + Math.random() * 0.08));

      keywords.push({
        id: `keyword_${adGroupIndex}_${i}`,
        adGroupId: adGroup.id,
        text: `${keywordSamples[Math.floor(Math.random() * keywordSamples.length)]} ${matchType === "EXACT" ? "" : "+ variant"}`,
        matchType,
        status: adGroup.status,
        qualityScore,
        expectedCTR,
        adRelevance,
        landingPageExperience: landingPage,
        spend,
        impressions,
        clicks,
        conversions,
        ctr: clicks / impressions,
        avgCpc: spend / clicks,
        cpa: conversions > 0 ? spend / conversions : spend,
      });
    }
  });

  return keywords;
}

export function generateSearchTerms(keywords: Keyword[]): SearchTerm[] {
  const searchTerms: SearchTerm[] = [];

  keywords.forEach((keyword) => {
    const termCount = 2 + Math.floor(Math.random() * 4);

    for (let i = 0; i < termCount; i++) {
      const impressions = Math.round(keyword.impressions * (0.2 + Math.random() * 0.4));
      const clicks = Math.round(impressions * keyword.ctr * (0.8 + Math.random() * 0.4));
      const spend = keyword.spend * (impressions / keyword.impressions);
      const conversions = Math.round(clicks * (0.02 + Math.random() * 0.06));

      searchTerms.push({
        term: `${keyword.text} ${i}`,
        matchType: keyword.matchType,
        impressions,
        clicks,
        spend,
        conversions,
        ctr: clicks / impressions,
        conversionRate: clicks > 0 ? conversions / clicks : 0,
        roas: conversions > 0 ? (conversions * 75) / spend : 0,
        addedAsNegative: Math.random() > 0.8,
      });
    }
  });

  return searchTerms;
}

export function generateAssetGroups(campaigns: Campaign[]): AssetGroup[] {
  const assetGroups: AssetGroup[] = [];
  const pmaxCampaigns = campaigns.filter((c) => c.type === "PERFORMANCE_MAX");

  pmaxCampaigns.forEach((campaign, campaignIndex) => {
    const groupCount = 2 + Math.floor(Math.random() * 3);

    for (let i = 0; i < groupCount; i++) {
      const strengthValues: AdStrength[] = ["EXCELLENT", "GOOD", "AVERAGE", "POOR"];
      const strengthWeights = [0.2, 0.4, 0.3, 0.1];
      let random = Math.random();
      let strength: AdStrength = "EXCELLENT";
      for (let j = 0; j < strengthValues.length; j++) {
        if (random < strengthWeights.slice(0, j + 1).reduce((a, b) => a + b, 0)) {
          strength = strengthValues[j];
          break;
        }
      }

      const roas = strength === "EXCELLENT" ? 3 + Math.random() * 2 :
                   strength === "GOOD" ? 2 + Math.random() * 1 :
                   strength === "AVERAGE" ? 1 + Math.random() * 1 :
                   Math.random() * 1;

      const spend = campaign.spend * (0.5 / groupCount + Math.random() * 0.5 / groupCount);
      const conversions = Math.round(spend / (50 + Math.random() * 100));
      const conversionValue = conversions * (50 + Math.random() * 150);

      assetGroups.push({
        id: `asset_group_${campaignIndex}_${i}`,
        campaignId: campaign.id,
        name: `Asset Group ${i + 1}`,
        adStrength: strength,
        status: campaign.status,
        spend,
        conversions,
        conversionValue,
        roas,
      });
    }
  });

  return assetGroups;
}

export function generateListingGroups(assetGroups: AssetGroup[]): ListingGroup[] {
  const listingGroups: ListingGroup[] = [];
  const products = [
    { title: "Premium Wireless Headphones", id: "prod_001" },
    { title: "Ultra HD Monitor 4K", id: "prod_002" },
    { title: "Mechanical Keyboard", id: "prod_003" },
    { title: "Gaming Mouse", id: "prod_004" },
    { title: "USB-C Dock", id: "prod_005" },
    { title: "Laptop Stand", id: "prod_006" },
    { title: "Portable SSD 1TB", id: "prod_007" },
    { title: "Webcam HD", id: "prod_008" },
  ];

  assetGroups.forEach((assetGroup, assetGroupIndex) => {
    const groupCount = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < groupCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const spend = assetGroup.spend * (0.5 / groupCount + Math.random() * 0.5 / groupCount);
      const impressions = Math.round(spend / 0.1);
      const clicks = Math.round(impressions * (0.01 + Math.random() * 0.03));
      const conversions = Math.random() > 0.3 ? Math.round(clicks * (0.01 + Math.random() * 0.05)) : 0;

      const hasIssues = Math.random() > 0.8;
      const issueType = hasIssues
        ? (Math.random() > 0.5 ? "DISAPPROVED" : "MISSING_DATA")
        : undefined;

      listingGroups.push({
        id: `listing_${assetGroupIndex}_${i}`,
        assetGroupId: assetGroup.id,
        productTitle: product.title,
        productId: product.id,
        status: conversions === 0 && spend > 50 ? "PAUSED" : "ENABLED",
        spend,
        impressions,
        clicks,
        conversions,
        ctr: clicks / impressions,
        cpa: conversions > 0 ? spend / conversions : 0,
        roas: conversions > 0 ? (conversions * 75) / spend : 0,
        hasIssues,
        issueType,
      });
    }
  });

  return listingGroups;
}

export function generateVideoMetrics(): VideoPerformance[] {
  const videos: VideoPerformance[] = [];
  const videoTitles = [
    "Product Overview - 60s",
    "Customer Testimonial - 30s",
    "How-To Guide - 90s",
    "Brand Story - 2min",
    "Demo Video - 45s",
  ];

  for (let i = 0; i < 8; i++) {
    const impressions = Math.round(50000 + Math.random() * 100000);
    const views = Math.round(impressions * (0.3 + Math.random() * 0.4));
    const quartile25 = Math.round(views * (0.7 + Math.random() * 0.2));
    const quartile50 = Math.round(quartile25 * (0.6 + Math.random() * 0.3));
    const quartile75 = Math.round(quartile50 * (0.7 + Math.random() * 0.2));
    const quartile100 = Math.round(quartile75 * (0.5 + Math.random() * 0.3));

    const spend = 1000 + Math.random() * 5000;
    const conversions = Math.round(views * (0.02 + Math.random() * 0.04));
    const conversionValue = conversions * (50 + Math.random() * 100);

    videos.push({
      videoId: `video_${i}`,
      title: videoTitles[i % videoTitles.length],
      thumbnail: `/images/video-placeholder-${(i % 3) + 1}.jpg`,
      impressions,
      views,
      quartile25,
      quartile50,
      quartile75,
      quartile100,
      viewRate: views / impressions,
      spend,
      conversions,
      conversionValue,
    });
  }

  return videos;
}

export function generateDemographics(): DemographicPerformance[] {
  const demographics: DemographicPerformance[] = [];
  const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
  const genders = ["M", "F"];

  ageRanges.forEach((age) => {
    genders.forEach((gender) => {
      const baseSpend = 3000 + Math.random() * 5000;
      const spend = addVariance(baseSpend);
      const impressions = Math.round(spend / 0.08);
      const clicks = Math.round(impressions * (0.015 + Math.random() * 0.03));
      const conversions = Math.round(clicks * (0.02 + Math.random() * 0.05));
      const conversionValue = conversions * (60 + Math.random() * 120);

      demographics.push({
        age,
        gender,
        impressions,
        clicks,
        spend,
        conversions,
        cpa: conversions > 0 ? spend / conversions : 0,
        conversionRate: clicks > 0 ? conversions / clicks : 0,
        roas: conversions > 0 ? conversionValue / spend : 0,
      });
    });
  });

  return demographics;
}

export function generateGeoData(): GeoPerformance[] {
  const countries = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "JP", name: "Japan" },
    { code: "IN", name: "India" },
    { code: "BR", name: "Brazil" },
    { code: "MX", name: "Mexico" },
  ];

  return countries.map((country, index) => {
    const spend = (10000 - index * 800) * (0.8 + Math.random() * 0.4);
    const impressions = Math.round(spend / 0.08);
    const clicks = Math.round(impressions * (0.015 + Math.random() * 0.03));
    const conversions = Math.round(clicks * (0.02 + Math.random() * 0.05));
    const conversionValue = conversions * (60 + Math.random() * 120);

    return {
      countryCode: country.code,
      countryName: country.name,
      spend,
      impressions,
      clicks,
      conversions,
      roas: conversions > 0 ? conversionValue / spend : 0,
      ctr: clicks / impressions,
      cpa: conversions > 0 ? spend / conversions : 0,
    };
  });
}

export function generateHourlyData(): HourlyPerformance[] {
  const data: HourlyPerformance[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isBusinessHours = hour >= 9 && hour <= 17;
      const isWeekend = day === 0 || day === 6;

      let baseMultiplier = 1;
      if (isBusinessHours) baseMultiplier = 1.8;
      if (hour >= 6 && hour < 9) baseMultiplier = 1.2;
      if (hour >= 18 && hour < 21) baseMultiplier = 1.5;
      if (hour >= 21 || hour < 6) baseMultiplier = 0.5;
      if (isWeekend && !isBusinessHours) baseMultiplier *= 0.8;

      const baseSpend = 300;
      const spend = baseSpend * baseMultiplier * (0.8 + Math.random() * 0.4);
      const impressions = Math.round(spend / 0.08);
      const clicks = Math.round(impressions * (0.015 + Math.random() * 0.03));
      const conversions = Math.round(clicks * (0.02 + Math.random() * 0.05));

      data.push({
        dayOfWeek: day,
        hour,
        impressions,
        clicks,
        spend,
        conversions,
        cpa: conversions > 0 ? spend / conversions : 0,
      });
    }
  }

  return data;
}

export function generateRecommendations(): Recommendation[] {
  const recommendations: Recommendation[] = [
    {
      id: "rec_001",
      type: "TARGET_CPA_OPT_IN",
      title: "Enable Target CPA bidding",
      description: "Your campaigns have sufficient conversion data to enable automated Target CPA bidding strategy",
      impact: "HIGH",
      estimatedConversions: 150,
      applyable: true,
    },
    {
      id: "rec_002",
      type: "CAMPAIGN_BUDGET",
      title: "Increase budget for top performer",
      description: "Campaign 'Search Campaign 1' has reached budget limit. Increase budget to capture more demand",
      impact: "HIGH",
      applyable: true,
    },
    {
      id: "rec_003",
      type: "KEYWORD",
      title: "Add high-intent keywords",
      description: "Add these 12 keywords showing strong commercial intent in your search terms report",
      impact: "MEDIUM",
      applyable: true,
    },
    {
      id: "rec_004",
      type: "SHOPPING_FIX_DISAPPROVED_PRODUCTS",
      title: "Fix 5 disapproved products",
      description: "5 products in your feed have been disapproved. Fix their attributes to re-enable them",
      impact: "HIGH",
      applyable: true,
    },
    {
      id: "rec_005",
      type: "RESPONSIVE_SEARCH_AD",
      title: "Create Responsive Search Ads",
      description: "Add responsive search ads to your campaigns for better performance",
      impact: "MEDIUM",
      applyable: false,
    },
    {
      id: "rec_006",
      type: "NEGATIVE_KEYWORD",
      title: "Add negative keywords",
      description: "These 8 search terms have high cost but low conversion rate. Consider adding them as negatives",
      impact: "MEDIUM",
      estimatedSpendReduction: 400,
      applyable: true,
    },
  ];

  return recommendations;
}

export function generateQualityScoreMatrix(): QualityScoreDataPoint[] {
  const keywords: QualityScoreDataPoint[] = [];
  const baseKeywords = [
    "best running shoes",
    "cheap flights online",
    "web design services",
    "digital marketing agency",
    "software development",
  ];

  baseKeywords.forEach((keyword, index) => {
    for (let i = 0; i < 3; i++) {
      const qualityScore = Math.floor(1 + Math.random() * 10);
      const expectedCTRValue: QualityComponent[] = ["ABOVE_AVERAGE", "AVERAGE", "BELOW_AVERAGE"];
      const expectedCTR = expectedCTRValue[Math.floor(Math.random() * 3)];
      const adRelevanceValues: QualityComponent[] = ["ABOVE_AVERAGE", "AVERAGE", "BELOW_AVERAGE"];
      const adRelevance = adRelevanceValues[Math.floor(Math.random() * 3)];
      const landingPageValues: QualityComponent[] = ["ABOVE_AVERAGE", "AVERAGE", "BELOW_AVERAGE"];
      const landingPageExperience = landingPageValues[Math.floor(Math.random() * 3)];

      const spend = 500 + Math.random() * 3000;
      const cpa = 20 + Math.random() * 100;

      keywords.push({
        keywordId: `kw_${index}_${i}`,
        keyword: `${keyword} ${i > 0 ? `variant ${i}` : ""}`,
        qualityScore,
        cpa,
        spend,
        expectedCTR,
        adRelevance,
        landingPageExperience,
        status: "ENABLED",
      });
    }
  });

  return keywords;
}
