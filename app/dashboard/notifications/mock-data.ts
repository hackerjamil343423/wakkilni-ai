import { Notification, NotificationPreferences } from "./types";

export const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "warning",
    title: "Budget Alert - Meta Ads",
    message: "Campaign 'Summer Sale' has spent 90% of daily budget",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    read: false,
    important: true,
    platform: "meta",
    actionUrl: "/dashboard/meta-ads",
    actionLabel: "View Campaign",
  },
  {
    id: "notif-2",
    type: "success",
    title: "Performance Milestone",
    message: "Google Ads campaign achieved 5x ROAS target",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    important: true,
    platform: "google",
  },
  {
    id: "notif-3",
    type: "info",
    title: "New Insights Available",
    message: "3 new AI-generated insights are ready for review",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
    important: false,
    platform: "system",
    actionUrl: "/dashboard/insights",
    actionLabel: "View Insights",
  },
  {
    id: "notif-4",
    type: "error",
    title: "Integration Error - TikTok Ads",
    message: "Failed to sync data. Please reconnect your account",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    important: true,
    platform: "tiktok",
    actionUrl: "/dashboard/connect-platform",
    actionLabel: "Reconnect",
  },
  {
    id: "notif-5",
    type: "info",
    title: "Weekly Report Ready",
    message: "Your weekly performance report is available",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    important: false,
    platform: "system",
  },
  {
    id: "notif-6",
    type: "success",
    title: "Campaign Optimization Complete",
    message: "Auto-optimization improved CTR by 23%",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    important: false,
    platform: "meta",
  },
  {
    id: "notif-7",
    type: "warning",
    title: "Low Inventory Alert",
    message: "Product SKU #4521 running low on stock",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    important: false,
    platform: "ecommerce",
    actionUrl: "/dashboard/ecommerce",
    actionLabel: "View Inventory",
  },
];

export const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  platformAlerts: {
    meta: true,
    google: true,
    tiktok: true,
    ecommerce: true,
  },
  performanceAlerts: true,
  budgetAlerts: true,
  digestFrequency: "daily",
};
