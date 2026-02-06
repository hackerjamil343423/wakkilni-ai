import { GoogleAdsApi, enums } from "google-ads-api";
import { Campaign, AdGroup, Keyword, DailyMetrics, Recommendation, GeoPerformance } from "@/app/dashboard/google-ads/types";
import { getGoogleAdsCredentials } from "./credentials";
import { GOOGLE_ADS_API_VERSION } from "./api-client";
import { transformCampaign, transformAdGroup, transformKeyword, transformMetrics, transformRecommendation, transformGeoPerformance } from "./transformers";
import { db } from "@/db";
import { googleAdsAccount } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export interface CampaignFilters {
  customerId: string;
  startDate?: Date;
  endDate?: Date;
  campaignTypes?: string[];
  campaignStatuses?: string[];
}

export interface AdGroupFilters {
  customerId: string;
  campaignIds?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface KeywordFilters {
  customerId: string;
  adGroupIds?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface MetricsFilters {
  customerId: string;
  startDate: Date;
  endDate: Date;
}

export interface GeoFilters {
  customerId: string;
  startDate?: Date;
  endDate?: Date;
}

export class GoogleAdsService {
  private client: GoogleAdsApi;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    const credentials = getGoogleAdsCredentials(userId);
    this.client = new GoogleAdsApi({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      developer_token: credentials.developerToken,
    });
  }

  /**
   * Get account details (loginCustomerId, refreshToken) for a specific customer
   */
  private async getAccountDetails(customerId: string): Promise<{
    refreshToken: string;
    loginCustomerId: string;
  }> {
    const result = await db
      .select({
        refreshToken: googleAdsAccount.refreshToken,
        loginCustomerId: googleAdsAccount.loginCustomerId,
      })
      .from(googleAdsAccount)
      .where(
        and(
          eq(googleAdsAccount.userId, this.userId),
          eq(googleAdsAccount.customerId, customerId)
        )
      )
      .limit(1);

    if (!result || result.length === 0) {
      throw new Error(
        "No Google Ads account found. Please connect your Google Ads account."
      );
    }

    return {
      refreshToken: result[0].refreshToken,
      loginCustomerId: result[0].loginCustomerId,
    };
  }

  /**
   * Create a configured Customer instance with proper token and login_customer_id
   */
  private async createCustomer(customerId: string) {
    const { refreshToken, loginCustomerId } = await this.getAccountDetails(customerId);
    try {
      return this.client.Customer({
        customer_id: customerId,
        login_customer_id: loginCustomerId,
        refresh_token: refreshToken,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Failed to create Google Ads customer client:", { customerId, loginCustomerId, error: msg });
      throw new Error(`Failed to initialize Google Ads client for customer ${customerId}: ${msg}`);
    }
  }

  /**
   * Fetch campaigns with metrics
   */
  async getCampaigns(filters: CampaignFilters): Promise<Campaign[]> {
    try {
      const customer = await this.createCustomer(filters.customerId);

      const dateRange = this.buildDateRange(filters.startDate, filters.endDate);

      // Build query conditions
      let whereClause = "campaign.status != 'REMOVED'";

      if (filters.campaignTypes && filters.campaignTypes.length > 0) {
        const types = filters.campaignTypes.map(t => `'${t}'`).join(", ");
        whereClause += ` AND campaign.advertising_channel_type IN (${types})`;
      }

      if (filters.campaignStatuses && filters.campaignStatuses.length > 0) {
        const statuses = filters.campaignStatuses.map(s => `'${s}'`).join(", ");
        whereClause += ` AND campaign.status IN (${statuses})`;
      }

      const query = `
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign_budget.amount_micros,
          metrics.cost_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.conversions_value,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_per_conversion,
          metrics.search_impression_share,
          metrics.search_rank_lost_impression_share,
          metrics.search_budget_lost_impression_share
        FROM campaign
        WHERE ${whereClause}
          AND segments.date BETWEEN ${dateRange}
        ORDER BY metrics.cost_micros DESC
      `;

      const campaigns = await customer.query(query);

      return campaigns.map(transformCampaign);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      throw new Error(`Failed to fetch campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch ad groups with metrics
   */
  async getAdGroups(filters: AdGroupFilters): Promise<AdGroup[]> {
    try {
      const customer = await this.createCustomer(filters.customerId);

      const dateRange = this.buildDateRange(filters.startDate, filters.endDate);

      let whereClause = "ad_group.status != 'REMOVED'";

      if (filters.campaignIds && filters.campaignIds.length > 0) {
        const ids = filters.campaignIds.join(", ");
        whereClause += ` AND campaign.id IN (${ids})`;
      }

      const query = `
        SELECT
          ad_group.id,
          ad_group.name,
          ad_group.status,
          campaign.id,
          metrics.cost_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_per_conversion
        FROM ad_group
        WHERE ${whereClause}
          AND segments.date BETWEEN ${dateRange}
        ORDER BY metrics.cost_micros DESC
      `;

      const adGroups = await customer.query(query);

      return adGroups.map(transformAdGroup);
    } catch (error) {
      console.error("Error fetching ad groups:", error);
      throw new Error(`Failed to fetch ad groups: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch keywords with quality score data
   */
  async getKeywords(filters: KeywordFilters): Promise<Keyword[]> {
    try {
      const customer = await this.createCustomer(filters.customerId);

      const dateRange = this.buildDateRange(filters.startDate, filters.endDate);

      let whereClause = "ad_group_criterion.status != 'REMOVED' AND ad_group_criterion.type = 'KEYWORD'";

      if (filters.adGroupIds && filters.adGroupIds.length > 0) {
        const ids = filters.adGroupIds.join(", ");
        whereClause += ` AND ad_group.id IN (${ids})`;
      }

      const query = `
        SELECT
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          ad_group_criterion.quality_info.quality_score,
          ad_group_criterion.quality_info.creative_quality_score,
          ad_group_criterion.quality_info.post_click_quality_score,
          ad_group_criterion.quality_info.search_predicted_ctr,
          ad_group.id,
          metrics.cost_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_per_conversion
        FROM keyword_view
        WHERE ${whereClause}
          AND segments.date BETWEEN ${dateRange}
        ORDER BY metrics.cost_micros DESC
      `;

      const keywords = await customer.query(query);

      return keywords.map(transformKeyword);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      throw new Error(`Failed to fetch keywords: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch daily aggregated metrics
   * Uses 'customer' resource for account-level aggregation (one row per date)
   */
  async getDailyMetrics(filters: MetricsFilters): Promise<DailyMetrics[]> {
    try {
      const customer = await this.createCustomer(filters.customerId);

      const dateRange = this.buildDateRange(filters.startDate, filters.endDate);

      // Use 'customer' resource for account-level aggregation
      // This returns one row per date with totals across all campaigns
      const query = `
        SELECT
          segments.date,
          metrics.cost_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.conversions_value,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_per_conversion,
          metrics.search_impression_share
        FROM customer
        WHERE segments.date BETWEEN ${dateRange}
        ORDER BY segments.date ASC
      `;

      const metrics = await customer.query(query);

      return metrics.map(transformMetrics);
    } catch (error) {
      console.error("Error fetching daily metrics:", error);
      throw new Error(`Failed to fetch daily metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch Google Ads recommendations
   */
  async getRecommendations(customerId: string): Promise<Recommendation[]> {
    try {
      const customer = await this.createCustomer(customerId);

      const query = `
        SELECT
          recommendation.resource_name,
          recommendation.type,
          recommendation.dismissed,
          recommendation.impact.base_metrics.impressions,
          recommendation.impact.base_metrics.clicks,
          recommendation.impact.base_metrics.conversions,
          recommendation.impact.base_metrics.cost_micros
        FROM recommendation
        WHERE recommendation.dismissed = FALSE
        LIMIT 20
      `;

      const recommendations = await customer.query(query);

      return recommendations.map(transformRecommendation);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw new Error(`Failed to fetch recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply a recommendation using the RecommendationService
   */
  async applyRecommendation(customerId: string, recommendationId: string): Promise<{ success: boolean }> {
    try {
      const { refreshToken, loginCustomerId } = await this.getAccountDetails(customerId);
      const accessToken = await this.getAccessTokenForCustomer(customerId);

      // Use REST API to apply recommendation (more reliable than SDK for mutations)
      const cleanCustomerId = customerId.replace(/-/g, '');
      const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanCustomerId}/recommendations:apply`;

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
      };

      if (loginCustomerId && loginCustomerId !== customerId) {
        headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          operations: [{
            resource_name: recommendationId,
          }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to apply recommendation: ${errorText}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Error applying recommendation:", error);
      throw new Error(`Failed to apply recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a valid access token for a customer (refresh if needed)
   */
  private async getAccessTokenForCustomer(customerId: string): Promise<string> {
    const { getAccessToken } = await import("./token-manager");
    return getAccessToken(this.userId, customerId);
  }

  /**
   * Fetch geographic performance data
   */
  async getGeoPerformance(filters: GeoFilters): Promise<GeoPerformance[]> {
    try {
      const customer = await this.createCustomer(filters.customerId);

      const dateRange = this.buildDateRange(filters.startDate, filters.endDate);

      const query = `
        SELECT
          geographic_view.country_criterion_id,
          geographic_view.location_type,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          metrics.ctr
        FROM geographic_view
        WHERE geographic_view.location_type = 'LOCATION_OF_PRESENCE'
          AND segments.date BETWEEN ${dateRange}
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `;

      const geoData = await customer.query(query);

      return geoData.map(transformGeoPerformance);
    } catch (error) {
      console.error("Error fetching geo performance:", error);
      throw new Error(`Failed to fetch geo performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build date range string for queries
   * Returns format suitable for BETWEEN operator: 'YYYY-MM-DD' AND 'YYYY-MM-DD'
   */
  private buildDateRange(startDate?: Date, endDate?: Date): string {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const formatDate = (date: Date) => {
      // Google Ads API requires YYYY-MM-DD format for BETWEEN operator
      return date.toISOString().split('T')[0];
    };

    return `'${formatDate(start)}' AND '${formatDate(end)}'`;
  }

}
