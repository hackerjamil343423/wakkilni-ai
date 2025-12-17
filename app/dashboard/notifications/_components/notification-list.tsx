"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Notification } from "../types";
import { formatDistanceToNow } from "date-fns";

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: NotificationListProps) {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "bg-blue-500/10 border-blue-500/20";
      case "warning":
        return "bg-orange-500/10 border-orange-500/20";
      case "success":
        return "bg-green-500/10 border-green-500/20";
      case "error":
        return "bg-red-500/10 border-red-500/20";
    }
  };

  if (notifications.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-muted-foreground">
          <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No notifications to display</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`${getTypeColor(notification.type)} border-l-4 ${
            !notification.read ? "bg-muted/20" : ""
          } transition-all duration-200 hover:shadow-md`}
        >
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">
                        {notification.title}
                      </h4>
                      {notification.important && (
                        <Badge variant="destructive" className="text-xs">
                          Important
                        </Badge>
                      )}
                      {!notification.read && (
                        <Badge variant="default" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.timestamp, {
                      addSuffix: true,
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    {notification.actionUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          (window.location.href = notification.actionUrl!)
                        }
                      >
                        {notification.actionLabel || "View"}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                    {!notification.read ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsUnread(notification.id)}
                      >
                        Mark as unread
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(notification.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
