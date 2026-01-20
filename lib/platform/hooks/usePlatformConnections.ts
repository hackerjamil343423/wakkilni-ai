"use client";

import { useEffect, useState, useCallback } from "react";
import { PLATFORMS, PlatformConfig } from "../config";

export interface PlatformConnectionStatus {
  platformId: string;
  connected: boolean;
  loading?: boolean;
}

export function usePlatformConnections() {
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const checkConnections = useCallback(async () => {
    setLoading(true);
    const results: Record<string, boolean> = {};

    // Check all platforms in parallel
    await Promise.all(
      PLATFORMS.map(async (platform) => {
        if (!platform.available) {
          results[platform.id] = false;
          return;
        }

        try {
          const response = await fetch(platform.connectionCheckPath);
          if (response.ok) {
            const data = await response.json();
            const hasAccounts = data.accounts && data.accounts.length > 0;
            results[platform.id] = hasAccounts;
          } else {
            results[platform.id] = false;
          }
        } catch (error) {
          console.error(`Error checking ${platform.id} connection:`, error);
          results[platform.id] = false;
        }
      })
    );

    setConnections(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkConnections();
  }, [checkConnections]);

  const isPlatformConnected = useCallback(
    (platformId: string): boolean => {
      return connections[platformId] ?? false;
    },
    [connections]
  );

  const getConnectedPlatforms = useCallback((): PlatformConfig[] => {
    return PLATFORMS.filter((p) => p.available && connections[p.id]);
  }, [connections]);

  return {
    connections,
    loading,
    isPlatformConnected,
    getConnectedPlatforms,
    refreshConnections: checkConnections,
  };
}
