import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface InsightsOverviewProps {
  totalInsights: number;
  pendingActions: number;
  impactScore: number;
  insightsThisWeek: number;
}

export function InsightsOverview({
  totalInsights,
  pendingActions,
  impactScore,
  insightsThisWeek,
}: InsightsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Insights */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Insights
          </CardTitle>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
            <Lightbulb className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInsights}</div>
          <p className="text-xs text-muted-foreground mt-1">
            AI-generated insights
          </p>
        </CardContent>
      </Card>

      {/* Pending Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Action Items
          </CardTitle>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10">
            <CheckCircle2 className="h-4 w-4 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingActions}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Pending actions
          </p>
        </CardContent>
      </Card>

      {/* Impact Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10">
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{impactScore}</div>
            <Badge
              variant={impactScore >= 70 ? "default" : "secondary"}
              className="text-xs"
            >
              {impactScore >= 70 ? "High" : "Medium"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Estimated impact potential
          </p>
        </CardContent>
      </Card>

      {/* This Week */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10">
            <Calendar className="h-4 w-4 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{insightsThisWeek}</div>
          <p className="text-xs text-muted-foreground mt-1">
            New insights generated
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
