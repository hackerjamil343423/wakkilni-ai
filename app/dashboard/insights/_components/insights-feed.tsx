"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SiFacebook,
  SiGoogle,
  SiTiktok,
} from "@icons-pack/react-simple-icons";
import { ShoppingCart, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { Insight } from "../types";
import { format } from "date-fns";

interface InsightsFeedProps {
  insights: Insight[];
}

export function InsightsFeed({ insights }: InsightsFeedProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredInsights = insights.filter((insight) => {
    if (selectedPlatform !== "all" && insight.platform !== selectedPlatform) {
      return false;
    }
    if (selectedType !== "all" && insight.type !== selectedType) {
      return false;
    }
    return true;
  });

  const getPlatformIcon = (platform: Insight["platform"]) => {
    switch (platform) {
      case "meta":
        return <SiFacebook className="w-4 h-4" />;
      case "google":
        return <SiGoogle className="w-4 h-4" />;
      case "tiktok":
        return <SiTiktok className="w-4 h-4" />;
      case "ecommerce":
        return <ShoppingCart className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: Insight["platform"]) => {
    switch (platform) {
      case "meta":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "google":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "tiktok":
        return "bg-black/10 text-black dark:text-white border-black/20";
      case "ecommerce":
        return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  const getTypeColor = (type: Insight["type"]) => {
    switch (type) {
      case "opportunity":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "warning":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
      case "recommendation":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    }
  };

  const getImpactColor = (impact: Insight["impact"]) => {
    switch (impact) {
      case "high":
        return "border-red-500 bg-red-500/5";
      case "medium":
        return "border-yellow-500 bg-yellow-500/5";
      case "low":
        return "border-green-500 bg-green-500/5";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <TabsList>
            <TabsTrigger value="all">All Platforms</TabsTrigger>
            <TabsTrigger value="meta">Meta</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList>
            <TabsTrigger value="all">All Types</TabsTrigger>
            <TabsTrigger value="opportunity">Opportunities</TabsTrigger>
            <TabsTrigger value="warning">Warnings</TabsTrigger>
            <TabsTrigger value="recommendation">Recommendations</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Insights Feed */}
      <div className="space-y-3">
        {filteredInsights.map((insight) => (
          <Card
            key={insight.id}
            className={`border-l-4 transition-all duration-200 hover:shadow-md ${getImpactColor(insight.impact)}`}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`${getPlatformColor(insight.platform)} border`}
                      >
                        <span className="mr-1">{getPlatformIcon(insight.platform)}</span>
                        {insight.platform.charAt(0).toUpperCase() + insight.platform.slice(1)}
                      </Badge>
                      <Badge variant="secondary" className={getTypeColor(insight.type)}>
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </Badge>
                      <Badge
                        variant={insight.impact === "high" ? "destructive" : "outline"}
                      >
                        {insight.impact.toUpperCase()} Impact
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-2xl font-bold text-primary">
                      {insight.impactScore}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Impact Score
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                {insight.metrics && insight.metrics.length > 0 && (
                  <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
                    {insight.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {metric.trend === "up" && (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                          {metric.trend === "down" && (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          {metric.trend === "neutral" && (
                            <Minus className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-sm font-medium">{metric.label}:</span>
                        <span className="text-sm font-bold">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Action */}
                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Suggested Action</p>
                    <p className="text-sm text-muted-foreground">
                      {insight.suggestedAction}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    {format(insight.createdAt, "MMM dd, yyyy • h:mm a")}
                  </span>
                  <Button variant="outline" size="sm">
                    Take Action
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No insights found with the selected filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
