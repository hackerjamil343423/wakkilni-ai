"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { PLATFORMS, PlatformConfig } from "@/lib/platform/config";
import { PlatformCardMenu } from "./_components/platform-card-menu";
import { PlatformDisconnectDialog } from "./_components/platform-disconnect-dialog";

interface PlatformWithConnection extends PlatformConfig {
  connected: boolean;
}

export default function ConnectPlatformPage() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<PlatformWithConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [platformToDisconnect, setPlatformToDisconnect] = useState<PlatformConfig | null>(null);

  // Fetch connection status for all platforms on mount
  useEffect(() => {
    const checkConnections = async () => {
      setLoading(true);
      const results: PlatformWithConnection[] = [];

      for (const platform of PLATFORMS) {
        let connected = false;

        if (platform.available) {
          try {
            const response = await fetch(platform.connectionCheckPath);
            if (response.ok) {
              const data = await response.json();
              connected = data.accounts && data.accounts.length > 0;
            }
          } catch (error) {
            console.error(`Error checking ${platform.id} connection:`, error);
          }
        }

        results.push({ ...platform, connected });
      }

      setPlatforms(results);
      setLoading(false);
    };

    checkConnections();
  }, []);

  const handleConnect = (platform: PlatformWithConnection) => {
    if (!platform.available) {
      // Coming soon platforms don't do anything
      return;
    }

    if (platform.connected) {
      // Navigate to account management if settings path exists
      if (platform.settingsPath) {
        router.push(platform.settingsPath);
      }
    } else {
      // Trigger OAuth flow if oauth path exists
      if (platform.oauthPath) {
        window.location.href = platform.oauthPath;
      }
    }
  };

  const handleOpenDisconnectDialog = (platform: PlatformConfig) => {
    setPlatformToDisconnect(platform);
    setDisconnectDialogOpen(true);
  };

  const handleDisconnect = async () => {
    if (!platformToDisconnect) return;

    try {
      // Platform-specific disconnect API
      const disconnectPath = platformToDisconnect.id === "google-ads"
        ? "/api/google-ads/disconnect"
        : platformToDisconnect.id === "meta-ads"
        ? "/api/meta-ads/disconnect"
        : `/api/${platformToDisconnect.id}/disconnect`;

      const method = platformToDisconnect.id === "meta-ads" ? "DELETE" : "POST";

      const response = await fetch(disconnectPath, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(method === "POST" && { body: JSON.stringify({ all: true }) }),
      });

      if (response.ok) {
        setPlatforms((prev) =>
          prev.map((p) =>
            p.id === platformToDisconnect.id ? { ...p, connected: false } : p
          )
        );
      } else {
        console.error(`Failed to disconnect ${platformToDisconnect.name}`);
      }
    } catch (error) {
      console.error("Error disconnecting platform:", error);
    }
  };

  const getButtonText = (platform: PlatformWithConnection) => {
    if (!platform.available) return "Coming Soon";
    if (platform.connected) return "Manage";
    return "Connect";
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
            className={`group relative bg-card border rounded-2xl p-6 transition-all duration-300 ${
              !platform.available
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-xl hover:border-primary/20"
            }`}
          >
            {/* Coming Soon Badge */}
            {!platform.available && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  Coming Soon
                </Badge>
              </div>
            )}

            {/* 3-dot menu for connected available platforms (except those with Manage button) */}
            {platform.available && platform.connected && (
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
                    platform.available && "group-hover:scale-110"
                  }`}
                  style={{
                    backgroundColor: !platform.available
                      ? "#E5E7EB"
                      : `${platform.color}15`,
                  }}
                >
                  <platform.icon
                    className="w-6 h-6"
                    style={{
                      color: !platform.available ? "#9CA3AF" : platform.color,
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

              {/* Connect/Coming Soon Button */}
              <Button
                onClick={() => handleConnect(platform)}
                disabled={!platform.available}
                className={`rounded-full px-6 font-medium transition-all duration-300 ${
                  !platform.available
                    ? "bg-amber-600 hover:bg-amber-700 text-white cursor-not-allowed"
                    : platform.connected
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90"
                }`}
              >
                {getButtonText(platform)}
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
