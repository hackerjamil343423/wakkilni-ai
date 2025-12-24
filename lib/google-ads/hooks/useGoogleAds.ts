/**
 * React hooks for fetching Google Ads data
 */

import { useState, useEffect, useCallback } from "react";
import {
  Campaign,
  AdGroup,
  Keyword,
  DailyMetrics,
  Recommendation,
  GeoPerformance,
  SearchTerm,
  AssetGroup,
  ListingGroup,
  VideoPerformance,
  DemographicPerformance,
  HourlyPerformance,
  QualityScoreDataPoint,
} from "@/app/dashboard/google-ads/types";

interface UseGoogleAdsDataOptions {
  customerId: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/**
 * Hook to fetch campaigns
 */
export function useCampaigns(options: UseGoogleAdsDataOptions) {
  const [data, setData] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!options.enabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        customerId: options.customerId,
      });

      if (options.startDate) {
        params.append("startDate", options.startDate.toISOString());
      }
      if (options.endDate) {
        params.append("endDate", options.endDate.toISOString());
      }

      const response = await fetch(`/api/google-ads/campaigns?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
      }

      const result: ApiResponse<Campaign[]> = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [options.customerId, options.startDate, options.endDate, options.enabled]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { data, loading, error, refetch: fetchCampaigns };
}

/**
 * Hook to fetch daily metrics
 */
export function useDailyMetrics(options: UseGoogleAdsDataOptions) {
  const [data, setData] = useState<DailyMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!options.enabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        customerId: options.customerId,
      });

      if (options.startDate) {
        params.append("startDate", options.startDate.toISOString());
      }
      if (options.endDate) {
        params.append("endDate", options.endDate.toISOString());
      }

      const response = await fetch(`/api/google-ads/metrics?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const result: ApiResponse<DailyMetrics[]> = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [options.customerId, options.startDate, options.endDate, options.enabled]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
}

/**
 * Hook to fetch keywords
 */
export function useKeywords(options: UseGoogleAdsDataOptions) {
  const [data, setData] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchKeywords = useCallback(async () => {
    if (!options.enabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        customerId: options.customerId,
      });

      if (options.startDate) {
        params.append("startDate", options.startDate.toISOString());
      }
      if (options.endDate) {
        params.append("endDate", options.endDate.toISOString());
      }

      const response = await fetch(`/api/google-ads/keywords?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch keywords: ${response.statusText}`);
      }

      const result: ApiResponse<Keyword[]> = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [options.customerId, options.startDate, options.endDate, options.enabled]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  return { data, loading, error, refetch: fetchKeywords };
}

/**
 * Hook to fetch recommendations
 */
export function useRecommendations(customerId: string, enabled = true) {
  const [data, setData] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ customerId });
      const response = await fetch(`/api/google-ads/recommendations?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const result: ApiResponse<Recommendation[]> = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [customerId, enabled]);

  const applyRecommendation = useCallback(async (recommendationId: string) => {
    try {
      const response = await fetch("/api/google-ads/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, recommendationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply recommendation");
      }

      // Refresh recommendations after applying
      await fetchRecommendations();
      return true;
    } catch (err) {
      console.error("Error applying recommendation:", err);
      return false;
    }
  }, [customerId, fetchRecommendations]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    data,
    loading,
    error,
    refetch: fetchRecommendations,
    applyRecommendation
  };
}

/**
 * Hook to fetch geographic performance
 */
export function useGeoPerformance(options: UseGoogleAdsDataOptions) {
  const [data, setData] = useState<GeoPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGeoData = useCallback(async () => {
    if (!options.enabled) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        customerId: options.customerId,
      });

      if (options.startDate) {
        params.append("startDate", options.startDate.toISOString());
      }
      if (options.endDate) {
        params.append("endDate", options.endDate.toISOString());
      }

      const response = await fetch(`/api/google-ads/geo?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch geo data: ${response.statusText}`);
      }

      const result: ApiResponse<GeoPerformance[]> = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [options.customerId, options.startDate, options.endDate, options.enabled]);

  useEffect(() => {
    fetchGeoData();
  }, [fetchGeoData]);

  return { data, loading, error, refetch: fetchGeoData };
}

/**
 * Google Ads Account interface
 */
export interface GoogleAdsAccount {
  id: number;
  customerId: string;
  accountName: string;
  status: string;
  lastSyncedAt: Date | null;
}

/**
 * Hook to manage Google Ads connection status and multi-account management
 */
export function useGoogleAdsConnection() {
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all connected accounts
  const loadAccounts = useCallback(async () => {
    try {
      const response = await fetch("/api/google-ads/accounts");

      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const result = await response.json();
      const fetchedAccounts: GoogleAdsAccount[] = result.accounts || [];

      setAccounts(fetchedAccounts);
      setConnected(fetchedAccounts.length > 0);

      // Set active account
      if (fetchedAccounts.length > 0) {
        // Check localStorage for stored active account
        const storedActiveId = localStorage.getItem("googleAdsActiveCustomerId");
        const isValidStored = fetchedAccounts.some(
          (acc) => acc.customerId === storedActiveId
        );

        if (isValidStored && storedActiveId) {
          setActiveCustomerId(storedActiveId);
        } else {
          // Use first account as default
          setActiveCustomerId(fetchedAccounts[0].customerId);
          localStorage.setItem(
            "googleAdsActiveCustomerId",
            fetchedAccounts[0].customerId
          );
        }
      } else {
        setActiveCustomerId(null);
        localStorage.removeItem("googleAdsActiveCustomerId");
      }
    } catch (err) {
      console.error("Error loading accounts:", err);
      setAccounts([]);
      setConnected(false);
      setActiveCustomerId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    // Check URL params for connection success
    const params = new URLSearchParams(window.location.search);
    const isConnected = params.get("connected") === "true";

    if (isConnected) {
      // Clear the URL param
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }

    loadAccounts();
  }, [loadAccounts]);

  // Switch active account
  const switchAccount = useCallback((customerId: string) => {
    setActiveCustomerId(customerId);
    localStorage.setItem("googleAdsActiveCustomerId", customerId);
  }, []);

  // Connect new account (OAuth flow)
  const connect = useCallback(() => {
    window.location.href = "/api/google-ads/oauth/authorize";
  }, []);

  // Disconnect single account
  const disconnectAccount = useCallback(
    async (customerId: string) => {
      try {
        const response = await fetch("/api/google-ads/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        });

        if (!response.ok) {
          throw new Error("Failed to disconnect account");
        }

        // If disconnecting active account, switch to another or clear
        if (customerId === activeCustomerId) {
          const remainingAccounts = accounts.filter(
            (acc) => acc.customerId !== customerId
          );

          if (remainingAccounts.length > 0) {
            switchAccount(remainingAccounts[0].customerId);
          } else {
            setActiveCustomerId(null);
            setConnected(false);
            localStorage.removeItem("googleAdsActiveCustomerId");
          }
        }

        // Reload accounts
        await loadAccounts();
      } catch (err) {
        console.error("Error disconnecting account:", err);
        throw err;
      }
    },
    [activeCustomerId, accounts, switchAccount, loadAccounts]
  );

  // Disconnect all accounts
  const disconnectAll = useCallback(async () => {
    try {
      const response = await fetch("/api/google-ads/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect all accounts");
      }

      setAccounts([]);
      setActiveCustomerId(null);
      setConnected(false);
      localStorage.removeItem("googleAdsActiveCustomerId");
    } catch (err) {
      console.error("Error disconnecting all accounts:", err);
      throw err;
    }
  }, []);

  return {
    connected,
    accounts,
    activeCustomerId,
    customerId: activeCustomerId, // Backwards compatibility
    loading,
    connect,
    switchAccount,
    disconnectAccount,
    disconnectAll,
    disconnect: disconnectAccount, // Backwards compatibility
    refetchAccounts: loadAccounts,
  };
}
