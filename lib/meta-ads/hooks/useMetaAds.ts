/**
 * React hooks for Meta Ads data fetching and account management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface UseMetaAdsDataOptions {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  status?: string[];
  campaignIds?: string[];
  adSetIds?: string[];
  enabled?: boolean;
}

export interface UseMetaAdsInsightsOptions {
  accountId?: string;
  startDate: string;
  endDate: string;
  breakdowns?: string[];
  enabled?: boolean;
}

export interface UseMetaAdsDataResult<T = any[]> {
  data: T;
  loading: boolean;
  error: Error | null;
  refetch: () => void | Promise<void>;
}

export interface UseMetaAdsConnectionResult {
  accounts: any[];
  activeAccountId: string | null;
  activeAccount: any;
  loading: boolean;
  error: Error | null;
  switchAccount: (accountId: string) => void;
  disconnect: (accountId?: string) => Promise<void>;
  connect: () => void;
  refetch: () => Promise<void>;
}

// ============================================================================
// Account Management Hooks
// ============================================================================

/**
 * Hook to manage Meta Ads account connection
 */
export function useMetaAdsConnection() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);

  // Load accounts from API
  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/meta-ads/accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const data = await response.json();
      setAccounts(data.accounts || []);

      // Load active account from localStorage or use primary
      const storedAccountId = localStorage.getItem('meta-ads-active-account');
      if (storedAccountId && data.accounts.some((a: any) => a.id === storedAccountId)) {
        setActiveAccountId(storedAccountId);
      } else {
        // Use primary account or first account
        const primaryAccount = data.accounts.find((a: any) => a.isPrimary);
        const firstAccount = data.accounts[0];
        const defaultAccount = primaryAccount || firstAccount;
        if (defaultAccount) {
          setActiveAccountId(defaultAccount.id);
          localStorage.setItem('meta-ads-active-account', defaultAccount.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch active account
  const switchAccount = useCallback((accountId: string) => {
    setActiveAccountId(accountId);
    localStorage.setItem('meta-ads-active-account', accountId);
  }, []);

  // Disconnect account
  const disconnect = useCallback(async (accountId?: string) => {
    try {
      const url = accountId
        ? `/api/meta-ads/disconnect?accountId=${accountId}`
        : '/api/meta-ads/disconnect?all=true';

      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }

      // Reload accounts
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      throw err;
    }
  }, [loadAccounts]);

  // Initialize OAuth flow
  const connect = useCallback(() => {
    window.location.href = '/api/meta-ads/oauth/authorize';
  }, []);

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {
    accounts,
    activeAccountId,
    activeAccount: accounts.find((a) => a.id === activeAccountId),
    loading,
    error,
    switchAccount,
    disconnect,
    connect,
    refetch: loadAccounts,
  };
}

// ============================================================================
// Data Fetching Hooks
// ============================================================================

/**
 * Hook to fetch campaigns
 */
export function useCampaigns(options: UseMetaAdsDataOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled || !options.accountId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        accountId: options.accountId,
      });

      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.status) params.append('status', options.status.join(','));
      if (options.campaignIds) params.append('campaignIds', options.campaignIds.join(','));

      const response = await fetch(`/api/meta-ads/campaigns?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const result = await response.json();
      setData(result.campaigns || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.accountId, options.startDate, options.endDate, options.status, options.campaignIds, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData } as UseMetaAdsDataResult;
}

/**
 * Hook to fetch ad sets
 */
export function useAdSets(options: UseMetaAdsDataOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled || !options.accountId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        accountId: options.accountId,
      });

      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.status) params.append('status', options.status.join(','));
      if (options.campaignIds) params.append('campaignIds', options.campaignIds.join(','));

      const response = await fetch(`/api/meta-ads/ad-sets?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ad sets');
      }

      const result = await response.json();
      setData(result.adSets || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.accountId, options.startDate, options.endDate, options.status, options.campaignIds, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData } as UseMetaAdsDataResult;
}

/**
 * Hook to fetch ads
 */
export function useAds(options: UseMetaAdsDataOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled || !options.accountId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        accountId: options.accountId,
      });

      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.status) params.append('status', options.status.join(','));
      if (options.campaignIds) params.append('campaignIds', options.campaignIds.join(','));
      if (options.adSetIds) params.append('adSetIds', options.adSetIds.join(','));

      const response = await fetch(`/api/meta-ads/ads?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ads');
      }

      const result = await response.json();
      setData(result.ads || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.accountId, options.startDate, options.endDate, options.status, options.campaignIds, options.adSetIds, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData } as UseMetaAdsDataResult;
}

/**
 * Hook to fetch daily metrics
 */
export function useDailyMetrics(options: UseMetaAdsDataOptions & { level?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled || !options.accountId || !options.startDate || !options.endDate) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        accountId: options.accountId,
        startDate: options.startDate,
        endDate: options.endDate,
      });

      if (options.level) params.append('level', options.level);

      const response = await fetch(`/api/meta-ads/metrics/daily?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch daily metrics');
      }

      const result = await response.json();
      setData(result.metrics || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.accountId, options.startDate, options.endDate, options.level, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData } as UseMetaAdsDataResult;
}

/**
 * Hook to fetch creative performance
 */
export function useCreativePerformance(options: UseMetaAdsDataOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled || !options.accountId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        accountId: options.accountId,
      });

      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.status) params.append('status', options.status.join(','));
      if (options.campaignIds) params.append('campaignIds', options.campaignIds.join(','));

      const response = await fetch(`/api/meta-ads/creatives?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch creative performance');
      }

      const result = await response.json();
      setData(result.creatives || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.accountId, options.startDate, options.endDate, options.status, options.campaignIds, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData } as UseMetaAdsDataResult;
}

/**
 * Hook to fetch funnel data
 */
export function useFunnelData(options: UseMetaAdsInsightsOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled || !options.accountId || !options.startDate || !options.endDate) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        accountId: options.accountId,
        startDate: options.startDate,
        endDate: options.endDate,
      });

      const response = await fetch(`/api/meta-ads/insights/funnel?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch funnel data');
      }

      const result = await response.json();
      setData(result.funnel || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.accountId, options.startDate, options.endDate, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData } as UseMetaAdsDataResult;
}

/**
 * Hook to fetch geo performance
 */
export function useGeoPerformance(options: UseMetaAdsInsightsOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled || !options.accountId || !options.startDate || !options.endDate) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        accountId: options.accountId,
        startDate: options.startDate,
        endDate: options.endDate,
      });

      if (options.breakdowns) params.append('breakdowns', options.breakdowns.join(','));

      const response = await fetch(`/api/meta-ads/insights/geo?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch geo performance');
      }

      const result = await response.json();
      setData(result.geoPerformance || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.accountId, options.startDate, options.endDate, options.breakdowns, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData } as UseMetaAdsDataResult;
}

/**
 * Hook to fetch frequency analysis
 */
export function useFrequencyAnalysis(options: UseMetaAdsInsightsOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled || !options.accountId || !options.startDate || !options.endDate) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        accountId: options.accountId,
        startDate: options.startDate,
        endDate: options.endDate,
      });

      const response = await fetch(`/api/meta-ads/insights/frequency?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch frequency analysis');
      }

      const result = await response.json();
      setData(result.frequencyAnalysis || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.accountId, options.startDate, options.endDate, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData } as UseMetaAdsDataResult;
}

/**
 * Hook to fetch demographics
 */
export function useDemographics(options: UseMetaAdsInsightsOptions) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!options.enabled || !options.accountId || !options.startDate || !options.endDate) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        accountId: options.accountId,
        startDate: options.startDate,
        endDate: options.endDate,
      });

      const response = await fetch(`/api/meta-ads/insights/demographics?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch demographics');
      }

      const result = await response.json();
      setData(result.demographics || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [options.accountId, options.startDate, options.endDate, options.enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData } as UseMetaAdsDataResult;
}
