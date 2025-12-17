"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCheck, Trash2 } from "lucide-react";

interface NotificationFiltersProps {
  activeTab: "all" | "unread" | "important";
  onTabChange: (tab: "all" | "unread" | "important") => void;
  onMarkAllAsRead: () => void;
  onDeleteAll: () => void;
  unreadCount: number;
}

export function NotificationFilters({
  activeTab,
  onTabChange,
  onMarkAllAsRead,
  onDeleteAll,
  unreadCount,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => onTabChange(value)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bulk Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
        <Button variant="outline" size="sm" onClick={onDeleteAll}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear all
        </Button>
      </div>
    </div>
  );
}
