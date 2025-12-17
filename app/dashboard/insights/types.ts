export interface Insight {
  id: string;
  platform: "meta" | "google" | "tiktok" | "ecommerce";
  type: "opportunity" | "warning" | "recommendation";
  title: string;
  description: string;
  suggestedAction: string;
  impact: "high" | "medium" | "low";
  impactScore: number; // 0-100
  metrics?: {
    label: string;
    value: number;
    trend: "up" | "down" | "neutral";
  }[];
  createdAt: Date;
  priority: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "dismissed";
  platform: "meta" | "google" | "tiktok" | "ecommerce";
  estimatedImpact: string;
  dueDate?: Date;
}

export interface OpportunityData {
  category: string;
  value: number;
  potential: number;
}
