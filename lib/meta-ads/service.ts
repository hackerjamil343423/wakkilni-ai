/**
 * Meta Ads Service - Business logic layer
 * Orchestrates API calls, transformations, caching, and audit logging
 */

import { getAccessToken, getAccount } from './token-manager';
import * as apiClient from './api-client';
import * as transformers from './transformers';
import * as cache from './cache';
import * as auditLog from './audit-log';

export interface MetaAdsServiceOptions {
  userId: string;
  accountId: string; // Meta account ID (act_xxxx format) or internal DB ID
}

export interface CampaignFilters {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status?: string[]; // ['ACTIVE', 'PAUSED']
  campaignIds?: string[];
}

export interface AdSetFilters {
  startDate?: string;
  endDate?: string;
  status?: string[];
  campaignIds?: string[];
}

export interface AdFilters {
  startDate?: string;
  endDate?: string;
  status?: string[];
  campaignIds?: string[];
  adSetIds?: string[];
}

export interface MetricsFilters {
  startDate: string;
  endDate: string;
  level?: 'account' | 'campaign' | 'adset' | 'ad';
}

export interface InsightsFilters {
  startDate: string;
  endDate: string;
  breakdowns?: string[];
}

export class MetaAdsService {
  private userId: string;
  private accountId: string;

  constructor(options: MetaAdsServiceOptions) {
    this.userId = options.userId;
    this.accountId = options.accountId;
  }

  /**
   * Get access token for this account
   */
  private async getAccessToken(): Promise<string> {
    return getAccessToken(this.userId, this.accountId);
  }

  /**
   * Get account database record
   */
  private async getAccountRecord() {
    return getAccount(this.userId, this.accountId);
  }

  /**
   * Build time range object for Meta API
   */
  private buildTimeRange(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) {
      return undefined;
    }

    return {
      since: startDate,
      until: endDate,
    };
  }

  /**
   * Build filtering array for Meta API
   */
  private buildFiltering(filters: any): any[] | undefined {
    const filtering: any[] = [];

    if (filters.status && filters.status.length > 0) {
      filtering.push({
        field: 'status',
        operator: 'IN',
        value: filters.status,
      });
    }

    if (filters.campaignIds && filters.campaignIds.length > 0) {
      filtering.push({
        field: 'campaign.id',
        operator: 'IN',
        value: filters.campaignIds,
      });
    }

    return filtering.length > 0 ? filtering : undefined;
  }

  /**
   * Get campaigns with metrics
   */
  async getCampaigns(filters: CampaignFilters = {}) {
    const accessToken = await this.getAccessToken();
    const accountRecord = await this.getAccountRecord();

    if (!accountRecord) {
      throw new Error('Account not found');
    }

    // Build API options
    const options: apiClient.MetaApiOptions = {
      accessToken,
      timeRange: this.buildTimeRange(filters.startDate, filters.endDate),
      filtering: this.buildFiltering(filters),
      fields: [
        'id',
        'name',
        'objective',
        'status',
        'daily_budget',
        'lifetime_budget',
        'created_time',
        'updated_time',
      ],
    };

    // Fetch campaigns
    const campaignsResponse = await apiClient.getCampaigns(accountRecord.accountId, options);
    const campaigns = campaignsResponse.data || [];

    // Fetch insights for each campaign
    const campaignsWithInsights = await Promise.all(
      campaigns.map(async (campaign: any) => {
        try {
          const insightsResponse = await apiClient.getInsights(campaign.id, {
            accessToken,
            timeRange: options.timeRange,
            level: 'campaign',
          });
          const insights = insightsResponse.data?.[0];
          return transformers.transformCampaign(campaign, insights);
        } catch (error) {
          console.error(`Failed to fetch insights for campaign ${campaign.id}:`, error);
          return transformers.transformCampaign(campaign);
        }
      })
    );

    return campaignsWithInsights;
  }

  /**
   * Get ad sets with metrics
   */
  async getAdSets(filters: AdSetFilters = {}) {
    const accessToken = await this.getAccessToken();
    const accountRecord = await this.getAccountRecord();

    if (!accountRecord) {
      throw new Error('Account not found');
    }

    const options: apiClient.MetaApiOptions = {
      accessToken,
      timeRange: this.buildTimeRange(filters.startDate, filters.endDate),
      filtering: this.buildFiltering(filters),
      fields: [
        'id',
        'name',
        'campaign_id',
        'status',
        'daily_budget',
        'lifetime_budget',
        'targeting',
        'created_time',
        'updated_time',
      ],
    };

    const adSetsResponse = await apiClient.getAdSets(accountRecord.accountId, options);
    const adSets = adSetsResponse.data || [];

    // Fetch insights for each ad set
    const adSetsWithInsights = await Promise.all(
      adSets.map(async (adSet: any) => {
        try {
          const insightsResponse = await apiClient.getInsights(adSet.id, {
            accessToken,
            timeRange: options.timeRange,
            level: 'adset',
          });
          const insights = insightsResponse.data?.[0];
          return transformers.transformAdSet(adSet, insights);
        } catch (error) {
          console.error(`Failed to fetch insights for ad set ${adSet.id}:`, error);
          return transformers.transformAdSet(adSet);
        }
      })
    );

    return adSetsWithInsights;
  }

  /**
   * Get ads with metrics
   */
  async getAds(filters: AdFilters = {}) {
    const accessToken = await this.getAccessToken();
    const accountRecord = await this.getAccountRecord();

    if (!accountRecord) {
      throw new Error('Account not found');
    }

    const options: apiClient.MetaApiOptions = {
      accessToken,
      timeRange: this.buildTimeRange(filters.startDate, filters.endDate),
      filtering: this.buildFiltering(filters),
      fields: [
        'id',
        'name',
        'adset_id',
        'campaign_id',
        'status',
        'creative{id,title,body,image_url,thumbnail_url,object_story_spec,call_to_action_type}',
        'created_time',
        'updated_time',
      ],
    };

    const adsResponse = await apiClient.getAds(accountRecord.accountId, options);
    const ads = adsResponse.data || [];

    // Fetch insights for each ad
    const adsWithInsights = await Promise.all(
      ads.map(async (ad: any) => {
        try {
          const insightsResponse = await apiClient.getInsights(ad.id, {
            accessToken,
            timeRange: options.timeRange,
            level: 'ad',
          });
          const insights = insightsResponse.data?.[0];
          return transformers.transformAd(ad, insights);
        } catch (error) {
          console.error(`Failed to fetch insights for ad ${ad.id}:`, error);
          return transformers.transformAd(ad);
        }
      })
    );

    return adsWithInsights;
  }

  /**
   * Get daily metrics (time-series data)
   */
  async getDailyMetrics(filters: MetricsFilters) {
    const accessToken = await this.getAccessToken();
    const accountRecord = await this.getAccountRecord();

    if (!accountRecord) {
      throw new Error('Account not found');
    }

    // Check cache first
    if (accountRecord.id) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      const cached = await cache.getCachedDailyMetrics(accountRecord.id, startDate, endDate);

      if (cached && cached.length > 0) {
        return cached.map(transformers.transformDailyMetrics);
      }
    }

    // Fetch from API
    const insightsResponse = await apiClient.getDailyInsights(accountRecord.accountId, {
      accessToken,
      timeRange: {
        since: filters.startDate,
        until: filters.endDate,
      },
      level: filters.level || 'account',
    });

    const insights = insightsResponse.data || [];
    const transformed = insights.map(transformers.transformDailyMetrics);

    // Cache the results
    if (accountRecord.id && transformed.length > 0) {
      await cache.cacheDailyMetrics(accountRecord.id, transformed).catch((error) => {
        console.error('Failed to cache daily metrics:', error);
      });
    }

    return transformed;
  }

  /**
   * Get creative performance (40+ metrics)
   */
  async getCreativePerformance(filters: AdFilters = {}) {
    const accessToken = await this.getAccessToken();
    const accountRecord = await this.getAccountRecord();

    if (!accountRecord) {
      throw new Error('Account not found');
    }

    // Get ads first
    const adsResponse = await apiClient.getAds(accountRecord.accountId, {
      accessToken,
      timeRange: this.buildTimeRange(filters.startDate, filters.endDate),
      filtering: this.buildFiltering(filters),
    });

    const ads = adsResponse.data || [];

    // Fetch detailed insights for each ad with all creative metrics
    const creativePerformance = await Promise.all(
      ads.map(async (ad: any) => {
        try {
          const insightsResponse = await apiClient.getInsights(ad.id, {
            accessToken,
            timeRange: this.buildTimeRange(filters.startDate, filters.endDate),
            level: 'ad',
            fields: [
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
              'video_p25_watched_actions',
              'video_p50_watched_actions',
              'video_p75_watched_actions',
              'video_p95_watched_actions',
              'video_p100_watched_actions',
              'video_avg_time_watched_actions',
              'cost_per_thruplay_type',
              'purchase_roas',
              'quality_ranking',
              'engagement_rate_ranking',
              'conversion_rate_ranking',
            ],
          });
          const insights = insightsResponse.data?.[0];
          return transformers.transformCreativePerformance(ad, insights || {});
        } catch (error) {
          console.error(`Failed to fetch creative performance for ad ${ad.id}:`, error);
          return null;
        }
      })
    );

    return creativePerformance.filter((item) => item !== null);
  }

  /**
   * Get geographic performance
   */
  async getGeoPerformance(filters: InsightsFilters) {
    const accessToken = await this.getAccessToken();
    const accountRecord = await this.getAccountRecord();

    if (!accountRecord) {
      throw new Error('Account not found');
    }

    const insightsResponse = await apiClient.getGeoInsights(accountRecord.accountId, {
      accessToken,
      timeRange: {
        since: filters.startDate,
        until: filters.endDate,
      },
      breakdowns: filters.breakdowns || ['country'],
      level: 'account',
    });

    const insights = insightsResponse.data || [];
    return insights.map(transformers.transformGeoPerformance);
  }

  /**
   * Get frequency distribution
   */
  async getFrequencyAnalysis(filters: InsightsFilters) {
    const accessToken = await this.getAccessToken();
    const accountRecord = await this.getAccountRecord();

    if (!accountRecord) {
      throw new Error('Account not found');
    }

    const insightsResponse = await apiClient.getFrequencyInsights(accountRecord.accountId, {
      accessToken,
      timeRange: {
        since: filters.startDate,
        until: filters.endDate,
      },
      level: 'account',
    });

    const insights = insightsResponse.data || [];

    // Group by frequency buckets
    const buckets = new Map<string, any>();
    insights.forEach((insight: any) => {
      const frequency = parseInt(insight.frequency_value || '0', 10);
      let bucket: string;
      let min: number;
      let max: number | null;

      if (frequency === 1) {
        bucket = '1';
        min = 1;
        max = 1;
      } else if (frequency === 2) {
        bucket = '2';
        min = 2;
        max = 2;
      } else if (frequency === 3) {
        bucket = '3';
        min = 3;
        max = 3;
      } else if (frequency === 4) {
        bucket = '4';
        min = 4;
        max = 4;
      } else {
        bucket = '5+';
        min = 5;
        max = null;
      }

      if (!buckets.has(bucket)) {
        buckets.set(bucket, {
          frequencyBucket: bucket,
          frequencyMin: min,
          frequencyMax: max,
          reach: 0,
          impressions: 0,
          spend: '0',
          leads: 0,
          purchases: 0,
          conversions: '0',
          cpa: '0',
          cpm: '0',
          roas: '0',
        });
      }

      const data = buckets.get(bucket)!;
      data.reach += parseInt(insight.reach || '0', 10);
      data.impressions += parseInt(insight.impressions || '0', 10);
      data.spend = (parseFloat(data.spend) + parseFloat(insight.spend || '0')).toFixed(2);
    });

    return Array.from(buckets.values());
  }

  /**
   * Get demographic insights
   */
  async getDemographicInsights(filters: InsightsFilters) {
    const accessToken = await this.getAccessToken();
    const accountRecord = await this.getAccountRecord();

    if (!accountRecord) {
      throw new Error('Account not found');
    }

    const insightsResponse = await apiClient.getDemographicInsights(accountRecord.accountId, {
      accessToken,
      timeRange: {
        since: filters.startDate,
        until: filters.endDate,
      },
      level: 'account',
    });

    return insightsResponse.data || [];
  }

  /**
   * Invalidate all cached data for this account
   */
  async invalidateCache() {
    const accountRecord = await this.getAccountRecord();

    if (accountRecord?.id) {
      await cache.invalidateAccountCache(accountRecord.id);
    }
  }
}
