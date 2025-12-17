"use client";

import { useState } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { NotificationList } from "./_components/notification-list";
import { NotificationFilters } from "./_components/notification-filters";
import { NotificationPreferencesCard } from "./_components/notification-preferences";
import { mockNotifications, defaultPreferences } from "./mock-data";
import { Notification, NotificationPreferences } from "./types";

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "important">(
    "all"
  );
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const handleMarkAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: false } : notif
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "unread") return !notif.read;
    if (activeTab === "important") return notif.important;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <PageHeader
        title="Notifications"
        description="Stay updated with all your platform alerts and system notifications."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Notifications" },
        ]}
      />

      {/* Filters */}
      <NotificationFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteAll={handleDeleteAll}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onDelete={handleDelete}
          />
        </div>

        {/* Preferences Sidebar - Takes 1 column */}
        <div>
          <NotificationPreferencesCard
            preferences={preferences}
            onPreferencesChange={setPreferences}
          />
        </div>
      </div>
    </div>
  );
}
