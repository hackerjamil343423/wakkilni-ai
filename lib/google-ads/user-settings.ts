/**
 * Google Ads User Settings API
 * Manages user dashboard preferences, alert settings, and defaults
 */

import { db } from "@/db";
import { googleAdsUserSettings, googleAdsAccount } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface UserSettings {
  id: string;
  userId: string;
  defaultAccountId?: string;
  defaultDateRange: string;
  dashboardLayout?: string; // JSON
  kpiSelection?: string; // JSON
  chartPreferences?: string; // JSON
  emailAlertsEnabled: boolean;
  alertThresholds?: string; // JSON
  weeklyReportEnabled: boolean;
  currencyDisplay: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserSettingsInput {
  defaultAccountId?: string;
  defaultDateRange?: string;
  dashboardLayout?: string;
  kpiSelection?: string;
  chartPreferences?: string;
  emailAlertsEnabled?: boolean;
  alertThresholds?: string;
  weeklyReportEnabled?: boolean;
  currencyDisplay?: string;
  timezone?: string;
}

/**
 * Get user settings, creating defaults if not exists
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const settings = await db
    .select()
    .from(googleAdsUserSettings)
    .where(eq(googleAdsUserSettings.userId, userId))
    .limit(1);

  if (settings.length === 0) {
    return await createDefaultUserSettings(userId);
  }

  return settings[0] as UserSettings;
}

/**
 * Create default settings for a new user
 */
export async function createDefaultUserSettings(
  userId: string
): Promise<UserSettings> {
  const [newSettings] = await db
    .insert(googleAdsUserSettings)
    .values({
      id: nanoid(),
      userId,
      defaultDateRange: "30d",
      emailAlertsEnabled: true,
      weeklyReportEnabled: true,
      currencyDisplay: "USD",
      timezone: "UTC",
    })
    .returning();

  return newSettings as UserSettings;
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  input: UpdateUserSettingsInput
): Promise<UserSettings> {
  // Get existing settings
  const existing = await getUserSettings(userId);

  // Update settings
  const [updated] = await db
    .update(googleAdsUserSettings)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(googleAdsUserSettings.userId, userId))
    .returning();

  return updated as UserSettings;
}

/**
 * Set default account for user
 * Also updates isPrimary flag on the account
 */
export async function setDefaultAccount(
  userId: string,
  accountId: string
): Promise<UserSettings> {
  // Verify account belongs to user
  const account = await db
    .select()
    .from(googleAdsAccount)
    .where(
      and(
        eq(googleAdsAccount.id, accountId),
        eq(googleAdsAccount.userId, userId)
      )
    )
    .limit(1);

  if (account.length === 0) {
    throw new Error("Account not found or does not belong to user");
  }

  // Remove isPrimary from all user's accounts
  await db
    .update(googleAdsAccount)
    .set({ isPrimary: false })
    .where(eq(googleAdsAccount.userId, userId));

  // Set isPrimary on selected account
  await db
    .update(googleAdsAccount)
    .set({ isPrimary: true })
    .where(eq(googleAdsAccount.id, accountId));

  // Update user settings defaultAccountId
  const [updated] = await db
    .update(googleAdsUserSettings)
    .set({
      defaultAccountId: accountId,
      updatedAt: new Date(),
    })
    .where(eq(googleAdsUserSettings.userId, userId))
    .returning();

  return updated as UserSettings;
}

/**
 * Get user's default account ID
 */
export async function getDefaultAccountId(userId: string): Promise<string | null> {
  const settings = await getUserSettings(userId);
  return settings.defaultAccountId || null;
}

/**
 * Update dashboard layout (widget positions, sizes)
 */
export async function updateDashboardLayout(
  userId: string,
  layout: Record<string, unknown>
): Promise<UserSettings> {
  return await updateUserSettings(userId, {
    dashboardLayout: JSON.stringify(layout),
  });
}

/**
 * Update KPI selection (which KPIs to show)
 */
export async function updateKpiSelection(
  userId: string,
  kpis: string[]
): Promise<UserSettings> {
  return await updateUserSettings(userId, {
    kpiSelection: JSON.stringify(kpis),
  });
}

/**
 * Update chart preferences (colors, types)
 */
export async function updateChartPreferences(
  userId: string,
  preferences: Record<string, unknown>
): Promise<UserSettings> {
  return await updateUserSettings(userId, {
    chartPreferences: JSON.stringify(preferences),
  });
}

/**
 * Update alert thresholds (CPA, spend limits)
 */
export async function updateAlertThresholds(
  userId: string,
  thresholds: {
    maxCpa?: number;
    dailySpendLimit?: number;
    weeklySpendLimit?: number;
    lowImpressionsThreshold?: number;
    lowCtrThreshold?: number;
  }
): Promise<UserSettings> {
  return await updateUserSettings(userId, {
    alertThresholds: JSON.stringify(thresholds),
  });
}

/**
 * Toggle email alerts
 */
export async function toggleEmailAlerts(
  userId: string,
  enabled: boolean
): Promise<UserSettings> {
  return await updateUserSettings(userId, {
    emailAlertsEnabled: enabled,
  });
}

/**
 * Toggle weekly reports
 */
export async function toggleWeeklyReports(
  userId: string,
  enabled: boolean
): Promise<UserSettings> {
  return await updateUserSettings(userId, {
    weeklyReportEnabled: enabled,
  });
}

/**
 * Update currency display preference
 */
export async function updateCurrencyDisplay(
  userId: string,
  currency: string
): Promise<UserSettings> {
  return await updateUserSettings(userId, {
    currencyDisplay: currency,
  });
}

/**
 * Update timezone preference
 */
export async function updateTimezone(
  userId: string,
  timezone: string
): Promise<UserSettings> {
  return await updateUserSettings(userId, {
    timezone,
  });
}

/**
 * Delete user settings (when user is deleted)
 */
export async function deleteUserSettings(userId: string): Promise<void> {
  await db
    .delete(googleAdsUserSettings)
    .where(eq(googleAdsUserSettings.userId, userId));
}
