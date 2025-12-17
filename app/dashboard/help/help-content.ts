export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  articleCount: number;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
}

export const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of using Wakklni AI",
    icon: "🚀",
    articleCount: 5,
  },
  {
    id: "integrations",
    title: "Platform Integrations",
    description: "Connect your advertising platforms",
    icon: "🔌",
    articleCount: 8,
  },
  {
    id: "ai-features",
    title: "AI Features",
    description: "Understanding AI insights and recommendations",
    icon: "🤖",
    articleCount: 6,
  },
  {
    id: "billing",
    title: "Billing & Subscription",
    description: "Manage your subscription and payments",
    icon: "💳",
    articleCount: 4,
  },
  {
    id: "analytics",
    title: "Data & Analytics",
    description: "Understanding your performance data",
    icon: "📊",
    articleCount: 7,
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Common issues and solutions",
    icon: "🔧",
    articleCount: 10,
  },
];

export const popularArticles: HelpArticle[] = [
  {
    id: "article-1",
    title: "How to connect your Meta Ads account",
    content:
      "To connect your Meta Ads account, navigate to Settings > Integrations, click on 'Connect Meta Ads', and follow the OAuth flow. You'll need admin access to your Meta Business Manager account.",
    category: "integrations",
  },
  {
    id: "article-2",
    title: "Understanding Smart Insights",
    content:
      "Smart Insights uses AI to analyze your campaign data across all platforms and provides actionable recommendations. The impact score (0-100) indicates the potential value of implementing the suggested action.",
    category: "ai-features",
  },
  {
    id: "article-3",
    title: "How to set up budget alerts",
    content:
      "Go to Notifications > Preferences and enable 'Budget Alerts'. You can customize thresholds and choose whether to receive email or push notifications when budgets reach specified levels.",
    category: "getting-started",
  },
  {
    id: "article-4",
    title: "Interpreting performance metrics",
    content:
      "Key metrics include ROAS (Return on Ad Spend), CTR (Click-Through Rate), CVR (Conversion Rate), and CPA (Cost Per Acquisition). Green indicators show positive trends, red indicates decline, and yellow suggests stable performance.",
    category: "analytics",
  },
  {
    id: "article-5",
    title: "My integration is not syncing data",
    content:
      "First, check if your API credentials are still valid in Connect Platform. If the issue persists, try disconnecting and reconnecting the integration. Make sure you have the required permissions on the platform account.",
    category: "troubleshooting",
  },
];
