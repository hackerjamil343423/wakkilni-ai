/**
 * Meta Marketing API client with timeout and retry support
 *
 * @see https://developers.facebook.com/docs/marketing-apis
 * @see https://developers.facebook.com/docs/marketing-api/reference
 */

import { withRetry } from './retry';

const META_API_VERSION = process.env.META_API_VERSION || 'v19.0';
const META_GRAPH_API = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeout(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Check for Meta API rate limiting headers and handle backoff
 */
function checkRateLimits(response: Response): void {
  // Meta returns rate limit info in x-business-use-case-usage header
  const usageHeader = response.headers.get('x-business-use-case-usage');
  if (usageHeader) {
    try {
      const usage = JSON.parse(usageHeader);
      // If any usage is above 80%, log a warning
      Object.entries(usage).forEach(([key, value]: [string, any]) => {
        if (value && value.call_count >= 80) {
          console.warn(`[Meta API] High usage for ${key}: ${value.call_count}%`);
        }
      });
    } catch (e) {
      // Ignore parse errors
    }
  }
}

/**
 * Meta API Request Options
 */
export interface MetaApiOptions {
  accessToken: string;
  fields?: string[];
  datePreset?: string;
  timeRange?: {
    since: string; // YYYY-MM-DD
    until: string; // YYYY-MM-DD
  };
  filtering?: any[];
  breakdowns?: string[];
  level?: 'account' | 'campaign' | 'adset' | 'ad';
  limit?: number;
}

/**
 * Get account information
 */
export async function getAccount(
  accountId: string,
  accessToken: string,
  fields: string[] = ['id', 'name', 'account_id', 'currency', 'timezone_name', 'business']
): Promise<any> {
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: fields.join(','),
  });

  const url = `${META_GRAPH_API}/${accountId}?${params.toString()}`;

  return withRetry(
    async () => {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }, 30000);

      checkRateLimits(response);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API error (${response.status}): ${error.error?.message || response.statusText}`);
      }

      return response.json();
    },
    {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
    }
  );
}

/**
 * Get campaigns for an ad account
 */
export async function getCampaigns(
  accountId: string,
  options: MetaApiOptions
): Promise<any> {
  const fields = options.fields || [
    'id',
    'name',
    'objective',
    'status',
    'daily_budget',
    'lifetime_budget',
    'created_time',
    'updated_time'
  ];

  const params = new URLSearchParams({
    access_token: options.accessToken,
    fields: fields.join(','),
    limit: (options.limit || 100).toString(),
  });

  if (options.filtering && options.filtering.length > 0) {
    params.append('filtering', JSON.stringify(options.filtering));
  }

  const url = `${META_GRAPH_API}/${accountId}/campaigns?${params.toString()}`;

  return withRetry(
    async () => {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }, 60000);

      checkRateLimits(response);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API error (${response.status}): ${error.error?.message || response.statusText}`);
      }

      return response.json();
    },
    {
      maxAttempts: 3,
      baseDelayMs: 2000,
      maxDelayMs: 15000,
    }
  );
}

/**
 * Get ad sets for an ad account or campaign
 */
export async function getAdSets(
  accountId: string,
  options: MetaApiOptions
): Promise<any> {
  const fields = options.fields || [
    'id',
    'name',
    'campaign_id',
    'status',
    'daily_budget',
    'lifetime_budget',
    'targeting',
    'created_time',
    'updated_time'
  ];

  const params = new URLSearchParams({
    access_token: options.accessToken,
    fields: fields.join(','),
    limit: (options.limit || 100).toString(),
  });

  if (options.filtering && options.filtering.length > 0) {
    params.append('filtering', JSON.stringify(options.filtering));
  }

  const url = `${META_GRAPH_API}/${accountId}/adsets?${params.toString()}`;

  return withRetry(
    async () => {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }, 60000);

      checkRateLimits(response);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API error (${response.status}): ${error.error?.message || response.statusText}`);
      }

      return response.json();
    },
    {
      maxAttempts: 3,
      baseDelayMs: 2000,
      maxDelayMs: 15000,
    }
  );
}

/**
 * Get ads for an ad account, campaign, or ad set
 */
export async function getAds(
  accountId: string,
  options: MetaApiOptions
): Promise<any> {
  const fields = options.fields || [
    'id',
    'name',
    'adset_id',
    'campaign_id',
    'status',
    'creative{id,title,body,image_url,thumbnail_url,object_story_spec,call_to_action_type}',
    'created_time',
    'updated_time'
  ];

  const params = new URLSearchParams({
    access_token: options.accessToken,
    fields: fields.join(','),
    limit: (options.limit || 100).toString(),
  });

  if (options.filtering && options.filtering.length > 0) {
    params.append('filtering', JSON.stringify(options.filtering));
  }

  const url = `${META_GRAPH_API}/${accountId}/ads?${params.toString()}`;

  return withRetry(
    async () => {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }, 60000);

      checkRateLimits(response);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API error (${response.status}): ${error.error?.message || response.statusText}`);
      }

      return response.json();
    },
    {
      maxAttempts: 3,
      baseDelayMs: 2000,
      maxDelayMs: 15000,
    }
  );
}

/**
 * Get insights (metrics) for account, campaigns, ad sets, or ads
 *
 * This is the primary method for retrieving performance metrics.
 */
export async function getInsights(
  entityId: string, // Account ID, campaign ID, ad set ID, or ad ID
  options: MetaApiOptions
): Promise<any> {
  const fields = options.fields || [
    'spend',
    'impressions',
    'clicks',
    'reach',
    'frequency',
    'ctr',
    'cpc',
    'cpm',
    'cpp',
    'actions',
    'action_values',
    'cost_per_action_type',
    'conversions',
    'conversion_values'
  ];

  const params = new URLSearchParams({
    access_token: options.accessToken,
    fields: fields.join(','),
    limit: (options.limit || 100).toString(),
  });

  // Add time range
  if (options.timeRange) {
    params.append('time_range', JSON.stringify(options.timeRange));
  } else if (options.datePreset) {
    params.append('date_preset', options.datePreset);
  }

  // Add level (account, campaign, adset, ad)
  if (options.level) {
    params.append('level', options.level);
  }

  // Add breakdowns for demographic/geographic segmentation
  if (options.breakdowns && options.breakdowns.length > 0) {
    params.append('breakdowns', options.breakdowns.join(','));
  }

  // Add filtering
  if (options.filtering && options.filtering.length > 0) {
    params.append('filtering', JSON.stringify(options.filtering));
  }

  const url = `${META_GRAPH_API}/${entityId}/insights?${params.toString()}`;

  return withRetry(
    async () => {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }, 90000); // Insights can take longer

      checkRateLimits(response);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API error (${response.status}): ${error.error?.message || response.statusText}`);
      }

      return response.json();
    },
    {
      maxAttempts: 3,
      baseDelayMs: 3000,
      maxDelayMs: 20000,
    }
  );
}

/**
 * Get daily insights (time-series data)
 */
export async function getDailyInsights(
  accountId: string,
  options: MetaApiOptions
): Promise<any> {
  const fields = options.fields || [
    'date_start',
    'date_stop',
    'spend',
    'impressions',
    'clicks',
    'reach',
    'frequency',
    'ctr',
    'cpc',
    'cpm',
    'cpp',
    'actions',
    'action_values',
    'cost_per_action_type'
  ];

  const params = new URLSearchParams({
    access_token: options.accessToken,
    fields: fields.join(','),
    time_increment: '1', // Daily breakdown
    limit: (options.limit || 100).toString(),
  });

  // Add time range
  if (options.timeRange) {
    params.append('time_range', JSON.stringify(options.timeRange));
  } else if (options.datePreset) {
    params.append('date_preset', options.datePreset);
  }

  // Add level
  if (options.level) {
    params.append('level', options.level);
  } else {
    params.append('level', 'account');
  }

  const url = `${META_GRAPH_API}/${accountId}/insights?${params.toString()}`;

  return withRetry(
    async () => {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }, 90000);

      checkRateLimits(response);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API error (${response.status}): ${error.error?.message || response.statusText}`);
      }

      return response.json();
    },
    {
      maxAttempts: 3,
      baseDelayMs: 3000,
      maxDelayMs: 20000,
    }
  );
}

/**
 * Get geographic insights with breakdowns
 */
export async function getGeoInsights(
  accountId: string,
  options: MetaApiOptions
): Promise<any> {
  return getInsights(accountId, {
    ...options,
    breakdowns: ['country', ...(options.breakdowns || [])],
    level: options.level || 'account',
  });
}

/**
 * Get frequency insights
 */
export async function getFrequencyInsights(
  accountId: string,
  options: MetaApiOptions
): Promise<any> {
  return getInsights(accountId, {
    ...options,
    breakdowns: ['frequency_value', ...(options.breakdowns || [])],
    level: options.level || 'account',
  });
}

/**
 * Get demographic insights
 */
export async function getDemographicInsights(
  accountId: string,
  options: MetaApiOptions
): Promise<any> {
  return getInsights(accountId, {
    ...options,
    breakdowns: ['age', 'gender', ...(options.breakdowns || [])],
    level: options.level || 'account',
  });
}

/**
 * Validate an access token by making a test API call
 */
export async function validateAccessToken(
  accountId: string,
  accessToken: string
): Promise<boolean> {
  try {
    await getAccount(accountId, accessToken, ['id', 'name']);
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}
