"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ActionItem } from "../types";
import { format } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";

interface ActionItemsProps {
  items: ActionItem[];
}

export function ActionItems({ items: initialItems }: ActionItemsProps) {
  const [items, setItems] = useState(initialItems);

  const handleToggle = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "completed" ? "pending" : "completed",
            }
          : item
      )
    );
  };

  const handleDismiss = (id: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, status: "dismissed" as const } : item
      )
    );
  };

  const getPriorityColor = (priority: ActionItem["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    }
  };

  const activeItems = items.filter(
    (item) => item.status !== "dismissed" && item.status !== "completed"
  );
  const completedItems = items.filter((item) => item.status === "completed");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Action Items</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {activeItems.length} pending • {completedItems.length} completed
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {activeItems.length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Items */}
        <div className="space-y-3">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={item.id}
                checked={item.status === "completed"}
                onCheckedChange={() => handleToggle(item.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <label
                    htmlFor={item.id}
                    className="font-medium leading-none cursor-pointer"
                  >
                    {item.title}
                  </label>
                  <Badge
                    variant="outline"
                    className={`${getPriorityColor(item.priority)} border flex-shrink-0`}
                  >
                    {item.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{item.estimatedImpact}</span>
                  </div>
                  {item.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due {format(item.dueDate, "MMM dd")}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(item.id)}
                  >
                    Dismiss
                  </Button>
                  <Button size="sm">Take Action</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Completed ({completedItems.length})
            </h4>
            {completedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 opacity-50"
              >
                <Checkbox checked disabled className="mt-1" />
                <div className="flex-1">
                  <p className="text-sm line-through">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeItems.length === 0 && completedItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No action items at the moment
          </div>
        )}
      </CardContent>
    </Card>
  );
}
