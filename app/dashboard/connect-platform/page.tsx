"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, Store } from "lucide-react";
import {
  SiFacebook,
  SiGoogle,
  SiTiktok,
  SiSnapchat,
} from "@icons-pack/react-simple-icons";
import { PlatformCardMenu } from "./_components/platform-card-menu";
import { PlatformDisconnectDialog } from "./_components/platform-disconnect-dialog";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  connected: boolean;
  disabled?: boolean;
}

const integrations: Integration[] = [
  {
    id: "meta-ads",
    name: "Meta Ads",
    description: "Connect your Facebook and Instagram advertising campaigns to track performance and insights.",
    icon: SiFacebook,
    color: "#0866FF",
    connected: false,
  },
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Integrate your Google Ads campaigns to monitor spend, conversions, and ROI metrics.",
    icon: SiGoogle,
    color: "#4285F4",
    connected: false,
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads",
    description: "Track your TikTok advertising performance and analyze campaign effectiveness.",
    icon: SiTiktok,
    color: "#000000",
    connected: false,
  },
  {
    id: "snapchat-ads",
    name: "Snapchat Ads",
    description: "Connect Snapchat Ads to track impressions, engagement, and ad performance.",
    icon: SiSnapchat,
    color: "#FFFC00",
    connected: false,
    disabled: true,
  },
  {
    id: "salla",
    name: "Salla App",
    description: "Integrate your Salla e-commerce store to sync orders, products, and sales data.",
    icon: ShoppingBag,
    color: "#6C5CE7",
    connected: false,
    disabled: true,
  },
  {
    id: "zid",
    name: "Zid App",
    description: "Connect your Zid store to manage inventory, track sales, and analyze customer data.",
    icon: Store,
    color: "#00B894",
    connected: false,
    disabled: true,
  },
];

export default function ConnectPlatformPage() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<Integration[]>(integrations);
  const [loading, setLoading] = useState(true);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [platformToDisconnect, setPlatformToDisconnect] = useState<Integration | null>(null);

  // Fetch Google Ads connection status on mount
  useEffect(() => {
    const checkGoogleAdsConnection = async () => {
      try {
        const response = await fetch("/api/google-ads/accounts");
        if (response.ok) {
          const data = await response.json();
          const hasAccounts = data.accounts && data.accounts.length > 0;

          setPlatforms((prev) =>
            prev.map((platform) =>
              platform.id === "google-ads"
                ? { ...platform, connected: hasAccounts }
                : platform
            )
          );
        }
      } catch (error) {
        console.error("Error checking Google Ads connection:", error);
      } finally {
        setLoading(false);
      }
    };

    checkGoogleAdsConnection();
  }, []);

  const handleConnect = (id: string) => {
    // Special handling for Google Ads
    if (id === "google-ads") {
      const platform = platforms.find((p) => p.id === "google-ads");

      if (platform?.connected) {
        // Navigate to account management
        router.push("/dashboard/google-ads/settings/accounts");
      } else {
        // Trigger OAuth flow
        window.location.href = "/api/google-ads/oauth/authorize";
      }
      return;
    }

    // Default toggle behavior for other platforms
    setPlatforms((prev) =>
      prev.map((platform) =>
        platform.id === id
          ? { ...platform, connected: !platform.connected }
          : platform
      )
    );
  };

  const handleOpenDisconnectDialog = (platform: Integration) => {
    setPlatformToDisconnect(platform);
    setDisconnectDialogOpen(true);
  };

  const handleDisconnect = async () => {
    if (!platformToDisconnect) return;

    try {
      // Platform-specific disconnect logic
      if (platformToDisconnect.id === "google-ads") {
        const response = await fetch("/api/google-ads/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ all: true }),
        });

        if (response.ok) {
          setPlatforms((prev) =>
            prev.map((p) =>
              p.id === platformToDisconnect.id ? { ...p, connected: false } : p
            )
          );
        } else {
          console.error("Failed to disconnect Google Ads");
        }
      }
      // Add other platform disconnect handlers here as needed
      // else if (platformToDisconnect.id === "meta-ads") { ... }
    } catch (error) {
      console.error("Error disconnecting platform:", error);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Connect your tools</h2>
        <p className="text-muted-foreground text-base">
          Easily connect your applications and import data directly from contents and documents.
        </p>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`group relative bg-card border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${
              platform.disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-xl hover:border-primary/20"
            }`}
          >
            {/* 3-dot menu for connected platforms */}
            {platform.connected && !platform.disabled && (
              <div className="absolute top-4 right-4">
                <PlatformCardMenu
                  platformId={platform.id}
                  platformName={platform.name}
                  onDisconnect={() => handleOpenDisconnectDialog(platform)}
                />
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              {/* Icon and Content */}
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl transition-transform duration-300 ${
                    !platform.disabled && "group-hover:scale-110"
                  }`}
                  style={{
                    backgroundColor: platform.disabled
                      ? "#E5E7EB"
                      : `${platform.color}15`,
                  }}
                >
                  <platform.icon
                    className="w-6 h-6"
                    style={{
                      color: platform.disabled ? "#9CA3AF" : platform.color,
                    }}
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-lg">{platform.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {platform.description}
                  </p>
                </div>
              </div>

              {/* Connect Button */}
              <Button
                onClick={() => handleConnect(platform.id)}
                disabled={platform.disabled}
                className={`rounded-full px-6 font-medium transition-all duration-300 ${
                  platform.connected
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90"
                } ${platform.disabled && "cursor-not-allowed opacity-50"}`}
              >
                {platform.connected
                  ? platform.id === "google-ads" ? "Manage" : "Connected"
                  : "Connect"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Message */}
      <div className="max-w-5xl">
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 flex-shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
            This is just the starting point, and we'll take care of all the hard work from here!
          </p>
        </div>
      </div>

      {/* Disconnect Confirmation Dialog */}
      {platformToDisconnect && (
        <PlatformDisconnectDialog
          open={disconnectDialogOpen}
          onOpenChange={setDisconnectDialogOpen}
          platformName={platformToDisconnect.name}
          platformId={platformToDisconnect.id}
          onConfirm={handleDisconnect}
        />
      )}
    </div>
  );
}
