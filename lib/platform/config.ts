/**
 * Centralized platform configuration
 *
 * This file defines all available platforms, their metadata, and connection status.
 * It's used by both the sidebar (to show only connected platforms) and
 * the connect-platform page (to manage connections).
 */

import { ShoppingBag, Store } from "lucide-react";
import {
  SiFacebook,
  SiGoogle,
  SiTiktok,
  SiSnapchat,
} from "@icons-pack/react-simple-icons";

export interface PlatformConfig {
  id: string;
  name: string;
  description: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  dashboardPath: string;
  settingsPath?: string;
  oauthPath?: string;
  // API endpoint to check connection status
  connectionCheckPath: string;
  // Whether this platform is available or coming soon
  available: boolean;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "meta-ads",
    name: "Meta Ads",
    shortName: "Meta",
    description: "Connect your Facebook and Instagram advertising campaigns to track performance and insights.",
    icon: SiFacebook,
    color: "#0866FF",
    dashboardPath: "/dashboard/meta-ads",
    settingsPath: "/dashboard/meta-ads/settings/accounts",
    oauthPath: "/api/meta-ads/oauth/authorize",
    connectionCheckPath: "/api/meta-ads/accounts",
    available: true,
  },
  {
    id: "google-ads",
    name: "Google Ads",
    shortName: "Google",
    description: "Integrate your Google Ads campaigns to monitor spend, conversions, and ROI metrics.",
    icon: SiGoogle,
    color: "#4285F4",
    dashboardPath: "/dashboard/google-ads",
    settingsPath: "/dashboard/google-ads/settings/accounts",
    oauthPath: "/api/google-ads/oauth/authorize",
    connectionCheckPath: "/api/google-ads/accounts",
    available: true,
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads",
    shortName: "TikTok",
    description: "Track your TikTok advertising performance and analyze campaign effectiveness.",
    icon: SiTiktok,
    color: "#000000",
    dashboardPath: "/dashboard/tiktok-ads",
    settingsPath: "/dashboard/tiktok-ads/settings/accounts",
    oauthPath: "/api/tiktok-ads/oauth/authorize",
    connectionCheckPath: "/api/tiktok-ads/accounts",
    available: false, // Coming soon
  },
  {
    id: "snapchat-ads",
    name: "Snapchat Ads",
    shortName: "Snapchat",
    description: "Connect Snapchat Ads to track impressions, engagement, and ad performance.",
    icon: SiSnapchat,
    color: "#FFFC00",
    dashboardPath: "/dashboard/snapchat-ads",
    settingsPath: "/dashboard/snapchat-ads/settings/accounts",
    oauthPath: "/api/snapchat-ads/oauth/authorize",
    connectionCheckPath: "/api/snapchat-ads/accounts",
    available: false, // Coming soon
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    shortName: "Analytics",
    description: "Connect Google Analytics to track website traffic, user behavior, and conversion metrics.",
    icon: SiGoogle,
    color: "#F4B400",
    dashboardPath: "/dashboard/analytics",
    settingsPath: "/dashboard/analytics/settings/accounts",
    oauthPath: "/api/analytics/oauth/authorize",
    connectionCheckPath: "/api/analytics/accounts",
    available: false, // Coming soon
  },
  {
    id: "salla",
    name: "Salla App",
    shortName: "Salla",
    description: "Integrate your Salla e-commerce store to sync orders, products, and sales data.",
    icon: ShoppingBag,
    color: "#6C5CE7",
    dashboardPath: "/dashboard/salla",
    settingsPath: "/dashboard/salla/settings/accounts",
    oauthPath: "/api/salla/oauth/authorize",
    connectionCheckPath: "/api/salla/accounts",
    available: false, // Coming soon
  },
  {
    id: "zid",
    name: "Zid App",
    shortName: "Zid",
    description: "Connect your Zid store to manage inventory, track sales, and analyze customer data.",
    icon: Store,
    color: "#00B894",
    dashboardPath: "/dashboard/zid",
    settingsPath: "/dashboard/zid/settings/accounts",
    oauthPath: "/api/zid/oauth/authorize",
    connectionCheckPath: "/api/zid/accounts",
    available: false, // Coming soon
  },
];

/**
 * Get platform configuration by ID
 */
export function getPlatformById(id: string): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

/**
 * Get all available platforms (not coming soon)
 */
export function getAvailablePlatforms(): PlatformConfig[] {
  return PLATFORMS.filter((p) => p.available);
}

/**
 * Get all platforms that are coming soon
 */
export function getComingSoonPlatforms(): PlatformConfig[] {
  return PLATFORMS.filter((p) => !p.available);
}
