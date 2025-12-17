export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  important: boolean;
  actionUrl?: string;
  actionLabel?: string;
  platform?: "meta" | "google" | "tiktok" | "ecommerce" | "system";
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  platformAlerts: {
    meta: boolean;
    google: boolean;
    tiktok: boolean;
    ecommerce: boolean;
  };
  performanceAlerts: boolean;
  budgetAlerts: boolean;
  digestFrequency: "realtime" | "daily" | "weekly" | "never";
}
