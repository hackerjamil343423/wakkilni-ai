import { Insight, ActionItem, OpportunityData } from "./types";

export const generateMockInsights = (count: number): Insight[] => {
  const platforms: Insight["platform"][] = ["meta", "google", "tiktok", "ecommerce"];
  const types: Insight["type"][] = ["opportunity", "warning", "recommendation"];
  const impacts: Insight["impact"][] = ["high", "medium", "low"];

  const insightTemplates = [
    {
      title: "High-performing ad creative identified",
      description: "Ad creative #4521 has 45% higher CTR than average",
      suggestedAction: "Increase budget allocation to this creative by 30%",
      metrics: [
        { label: "CTR", value: 4.2, trend: "up" as const },
        { label: "CVR", value: 2.8, trend: "up" as const },
      ],
    },
    {
      title: "Budget optimization opportunity",
      description: "Campaign spending inefficiency detected in evening hours",
      suggestedAction: "Shift 20% of budget from 8PM-12AM to 2PM-6PM",
      metrics: [
        { label: "ROAS", value: 3.5, trend: "down" as const },
        { label: "CPA", value: 45, trend: "up" as const },
      ],
    },
    {
      title: "Audience segment underperforming",
      description: "Women 35-44 segment showing 30% lower engagement",
      suggestedAction: "Review creative messaging for this demographic",
      metrics: [
        { label: "Engagement", value: 1.8, trend: "down" as const },
        { label: "Conversion", value: 0.9, trend: "down" as const },
      ],
    },
    {
      title: "Competitor activity detected",
      description: "Increased ad spend from competitors in your category",
      suggestedAction: "Consider increasing bids by 15% to maintain visibility",
      metrics: [
        { label: "Impression Share", value: 65, trend: "down" as const },
        { label: "Avg Position", value: 2.3, trend: "down" as const },
      ],
    },
    {
      title: "Seasonal trend emerging",
      description: "Search volume increasing 40% for related keywords",
      suggestedAction: "Prepare additional inventory and increase campaign budget",
      metrics: [
        { label: "Search Vol", value: 14000, trend: "up" as const },
        { label: "Competition", value: 0.7, trend: "up" as const },
      ],
    },
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = insightTemplates[i % insightTemplates.length];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const impact = impacts[Math.floor(Math.random() * impacts.length)];

    return {
      id: `insight-${i + 1}`,
      platform,
      type,
      title: template.title,
      description: template.description,
      suggestedAction: template.suggestedAction,
      impact,
      impactScore: impact === "high" ? 85 : impact === "medium" ? 60 : 35,
      metrics: template.metrics,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      priority: impact === "high" ? 1 : impact === "medium" ? 2 : 3,
    };
  });
};

export const mockActionItems: ActionItem[] = [
  {
    id: "action-1",
    title: "Increase budget for top-performing campaign",
    description: "Meta Ads campaign 'Summer Sale' showing 3.5x ROAS",
    priority: "high",
    status: "pending",
    platform: "meta",
    estimatedImpact: "+$5,200 revenue/week",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "action-2",
    title: "Pause underperforming keywords",
    description: "12 keywords with CPA >$80 and 0 conversions in 30 days",
    priority: "high",
    status: "in_progress",
    platform: "google",
    estimatedImpact: "-$1,200 wasted spend/month",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "action-3",
    title: "Refresh ad creatives",
    description: "Current creatives showing fatigue (CTR down 35%)",
    priority: "medium",
    status: "pending",
    platform: "tiktok",
    estimatedImpact: "+2.5% CTR improvement",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "action-4",
    title: "Optimize product pricing",
    description: "Competitors pricing 8-12% lower on similar products",
    priority: "medium",
    status: "pending",
    platform: "ecommerce",
    estimatedImpact: "+15% conversion rate",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "action-5",
    title: "A/B test new landing page",
    description: "Current landing page has 2.1% bounce rate",
    priority: "low",
    status: "completed",
    platform: "meta",
    estimatedImpact: "+0.5% conversion rate",
  },
];

export const mockOpportunityData: OpportunityData[] = [
  { category: "Morning (6AM-12PM)", value: 65, potential: 85 },
  { category: "Afternoon (12PM-6PM)", value: 85, potential: 95 },
  { category: "Evening (6PM-12AM)", value: 45, potential: 70 },
  { category: "Night (12AM-6AM)", value: 20, potential: 30 },
  { category: "Mon-Fri", value: 75, potential: 90 },
  { category: "Weekend", value: 55, potential: 65 },
];
