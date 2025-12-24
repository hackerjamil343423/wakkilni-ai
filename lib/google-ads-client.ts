/**
 * Google Ads API Client Wrapper
 * Handles all interactions with the Google Ads API
 */

import { GoogleAdsApi, Customer } from "google-ads-api";
import { db } from "@/db/drizzle";
import { googleAdsAccount } from "@/db/schema";
import { eq } from "drizzle-orm";
import { refreshAccessToken as refreshOAuthToken } from "./google-ads-auth";
import {
  transformDailyMetrics,
  transformCampaigns,
  transformAdGroups,
  transformKeywords,
  transformGeoData,
  transformDemographics,
  getCountryName,
} from "./google-ads-transformer";
import type {
  Campaign,
  AdGroup,
  Keyword,
  GeoPerformance,
  DailyMetrics,
  DemographicPerformance,
} from "@/app/dashboard/google-ads/types";

/**
 * Fetches customer accounts accessible with an access token
 * @param accessToken - Valid Google OAuth access token with adwords scope
 * @returns Array of customer account details
 */
export async function fetchCustomerAccounts(
  accessToken: string
): Promise<
  Array<{
    customerId: string;
    accountName: string;
    currency: string;
    timezone: string;
    managerCustomerId?: string;
  }>
> {
  try {
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });

    // List accessible customers
    const customerService = client.Customer({
      customer_id: "0", // Use 0 to list all accessible customers
      refresh_token: "", // Not needed for listing
      access_token: accessToken,
    });

    const accessibleCustomers = await customerService.listAccessibleCustomers();

    // Fetch details for each customer
    const customerDetails = await Promise.all(
      accessibleCustomers.resource_names.map(async (resourceName) => {
        const customerId = resourceName.split("/")[1];

        try {
          const customer = client.Customer({
            customer_id: customerId,
            refresh_token: "",
            access_token: accessToken,
          });

          const [customerInfo] = await customer.query(`
            SELECT
              customer.id,
              customer.descriptive_name,
              customer.currency_code,
              customer.time_zone,
              customer.manager
            FROM customer
            WHERE customer.id = ${customerId}
          `);

          return {
            customerId,
            accountName:
              customerInfo.customer.descriptive_name || `Account ${customerId}`,
            currency: customerInfo.customer.currency_code || "USD",
            timezone: customerInfo.customer.time_zone || "UTC",
            managerCustomerId: customerInfo.customer.manager
              ? customerId
              : undefined,
          };
        } catch (error) {
          console.warn(
            `Failed to fetch details for customer ${customerId}:`,
            error
          );
          return {
            customerId,
            accountName: `Account ${customerId}`,
            currency: "USD",
            timezone: "UTC",
          };
        }
      })
    );

    return customerDetails;
  } catch (error) {
    console.error("Failed to fetch customer accounts:", error);
    throw new Error("Failed to fetch Google Ads accounts");
  }
}

/**
 * Refreshes access token for a Google Ads account
 * @param accountId - Database ID of the Google Ads account
 * @returns New access token
 */
export async function refreshAccessToken(accountId: string): Promise<string> {
  try {
    const [account] = await db
      .select()
      .from(googleAdsAccount)
      .where(eq(googleAdsAccount.id, accountId))
      .limit(1);

    if (!account) {
      throw new Error("Account not found");
    }

    // Check if token is still valid
    if (account.tokenExpiresAt > new Date()) {
      return account.accessToken;
    }

    // Refresh the token
    const { accessToken, expiresAt } = await refreshOAuthToken(
      account.refreshToken
    );

    // Update database
    await db
      .update(googleAdsAccount)
      .set({
        accessToken,
        tokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(googleAdsAccount.id, accountId));

    return accessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    throw new Error("Failed to refresh Google Ads access token");
  }
}

/**
 * Creates a Google Ads API customer client
 * @param accountId - Database ID of the Google Ads account
 * @returns Google Ads Customer client
 */
async function createCustomerClient(accountId: string): Promise<Customer> {
  try {
    const [account] = await db
      .select()
      .from(googleAdsAccount)
      .where(eq(googleAdsAccount.id, accountId))
      .limit(1);

    if (!account) {
      throw new Error("Account not found");
    }

    // Refresh access token if needed
    const accessToken = await refreshAccessToken(accountId);

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });

    return client.Customer({
      customer_id: account.customerId,
      refresh_token: account.refreshToken,
      access_token: accessToken,
      login_customer_id: account.loginCustomerId,
    });
  } catch (error) {
    console.error("Failed to create customer client:", error);
    throw new Error("Failed to initialize Google Ads client");
  }
}

/**
 * Interface for fetched metrics
 */
export interface GoogleAdsMetrics {
  daily: DailyMetrics[];
  campaigns: Campaign[];
  adGroups: AdGroup[];
  keywords: Keyword[];
  geoData: GeoPerformance[];
  demographics: DemographicPerformance[];
}

/**
 * Fetches all metrics for a Google Ads account
 * @param accountId - Database ID of the Google Ads account
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns All metrics data
 */
export async function fetchGoogleAdsMetrics(
  accountId: string,
  startDate: string,
  endDate: string
): Promise<GoogleAdsMetrics> {
  try {
    const customer = await createCustomerClient(accountId);

    // Execute all queries in parallel for better performance
    const [dailyData, campaignData, adGroupData, keywordData, geoData, demoData] =
      await Promise.all([
        // Daily metrics query
        customer.query(`
          SELECT
            segments.date,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.conversions_value,
            metrics.average_cpc,
            metrics.ctr
          FROM campaign
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
          ORDER BY segments.date ASC
        `),

        // Campaign performance query
        customer.query(`
          SELECT
            campaign.id,
            campaign.name,
            campaign.advertising_channel_type,
            campaign.status,
            campaign_budget.amount_micros,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.conversions_value,
            metrics.ctr,
            metrics.average_cpc,
            metrics.search_impression_share,
            metrics.search_lost_absolute_top_impression_share,
            metrics.search_budget_lost_impression_share
          FROM campaign
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
            AND campaign.status != 'REMOVED'
        `),

        // Ad group performance query
        customer.query(`
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            ad_group.campaign,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.ctr,
            metrics.average_cpc
          FROM ad_group
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
            AND ad_group.status != 'REMOVED'
          LIMIT 100
        `),

        // Keyword performance query with Quality Score
        customer.query(`
          SELECT
            ad_group_criterion.criterion_id,
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group_criterion.status,
            ad_group_criterion.ad_group,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.ctr,
            metrics.average_cpc,
            metrics.historical_quality_score,
            metrics.historical_expected_ctr,
            metrics.historical_ad_relevance,
            metrics.historical_landing_page_quality_score
          FROM keyword_view
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
            AND ad_group_criterion.status != 'REMOVED'
          LIMIT 100
        `),

        // Geographic performance query
        customer.query(`
          SELECT
            geographic_view.country_criterion_id,
            geographic_view.location_type,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions,
            metrics.conversions_value,
            metrics.ctr
          FROM geographic_view
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
          LIMIT 50
        `),

        // Demographic performance query
        customer.query(`
          SELECT
            ad_group_criterion.age_range.type,
            ad_group_criterion.gender.type,
            ad_group_criterion.income_range.type,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value
          FROM age_range_view
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
          LIMIT 50
        `),
      ]);

    // Transform all data to dashboard types
    const daily = transformDailyMetrics(dailyData);
    const campaigns = transformCampaigns(campaignData);
    const adGroups = transformAdGroups(adGroupData);
    const keywords = transformKeywords(keywordData);
    const geoDataTransformed = transformGeoData(geoData);
    const demographics = transformDemographics(demoData);

    // Map country names for geo data
    const geoDataWithNames = geoDataTransformed.map((geo) => ({
      ...geo,
      countryName: getCountryName(geo.countryCode),
    }));

    // Update account's last synced timestamp
    await db
      .update(googleAdsAccount)
      .set({
        lastSyncedAt: new Date(),
        syncError: null,
        updatedAt: new Date(),
      })
      .where(eq(googleAdsAccount.id, accountId));

    return {
      daily,
      campaigns,
      adGroups,
      keywords,
      geoData: geoDataWithNames,
      demographics,
    };
  } catch (error: any) {
    console.error("Failed to fetch Google Ads metrics:", error);

    // Log error to account
    await db
      .update(googleAdsAccount)
      .set({
        syncError: error.message || "Failed to fetch metrics",
        updatedAt: new Date(),
      })
      .where(eq(googleAdsAccount.id, accountId));

    // Handle specific Google Ads API errors
    if (error.message?.includes("RATE_LIMIT_EXCEEDED")) {
      throw new Error(
        "Rate limit exceeded. Please try again in a few minutes."
      );
    }

    if (error.message?.includes("AUTHENTICATION_ERROR")) {
      throw new Error(
        "Authentication failed. Please reconnect your Google Ads account."
      );
    }

    if (error.message?.includes("INVALID_CUSTOMER_ID")) {
      throw new Error("Invalid Google Ads account. Please reconnect.");
    }

    throw new Error("Failed to fetch Google Ads data");
  }
}

/**
 * Rate limiter to prevent exceeding Google Ads API quotas
 */
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minDelay = 100; // Minimum delay between requests in ms

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const fn = this.queue.shift()!;

    // Wait for minimum delay since last request
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minDelay - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    await fn();

    this.processing = false;
    this.processQueue();
  }
}

export const rateLimiter = new RateLimiter();
