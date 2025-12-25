import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getUserSettings,
  updateUserSettings,
  setDefaultAccount,
  updateDashboardLayout,
  updateKpiSelection,
  updateChartPreferences,
  updateAlertThresholds,
  toggleEmailAlerts,
  toggleWeeklyReports,
  updateCurrencyDisplay,
  updateTimezone,
} from "@/lib/google-ads/user-settings";

/**
 * GET /api/google-ads/settings
 * Get user settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getUserSettings(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        dashboardLayout: settings.dashboardLayout ? JSON.parse(settings.dashboardLayout) : undefined,
        kpiSelection: settings.kpiSelection ? JSON.parse(settings.kpiSelection) : undefined,
        chartPreferences: settings.chartPreferences ? JSON.parse(settings.chartPreferences) : undefined,
        alertThresholds: settings.alertThresholds ? JSON.parse(settings.alertThresholds) : undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch settings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/google-ads/settings
 * Update user settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Handle JSON fields
    const updates: Record<string, string | boolean | number> = {};
    if (body.dashboardLayout !== undefined) {
      updates.dashboardLayout = typeof body.dashboardLayout === "string"
        ? body.dashboardLayout
        : JSON.stringify(body.dashboardLayout);
    }
    if (body.kpiSelection !== undefined) {
      updates.kpiSelection = typeof body.kpiSelection === "string"
        ? body.kpiSelection
        : JSON.stringify(body.kpiSelection);
    }
    if (body.chartPreferences !== undefined) {
      updates.chartPreferences = typeof body.chartPreferences === "string"
        ? body.chartPreferences
        : JSON.stringify(body.chartPreferences);
    }
    if (body.alertThresholds !== undefined) {
      updates.alertThresholds = typeof body.alertThresholds === "string"
        ? body.alertThresholds
        : JSON.stringify(body.alertThresholds);
    }
    if (body.defaultAccountId !== undefined) {
      updates.defaultAccountId = body.defaultAccountId;
    }
    if (body.defaultDateRange !== undefined) {
      updates.defaultDateRange = body.defaultDateRange;
    }
    if (body.emailAlertsEnabled !== undefined) {
      updates.emailAlertsEnabled = body.emailAlertsEnabled;
    }
    if (body.weeklyReportEnabled !== undefined) {
      updates.weeklyReportEnabled = body.weeklyReportEnabled;
    }
    if (body.currencyDisplay !== undefined) {
      updates.currencyDisplay = body.currencyDisplay;
    }
    if (body.timezone !== undefined) {
      updates.timezone = body.timezone;
    }

    const settings = await updateUserSettings(session.user.id, updates);

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        dashboardLayout: settings.dashboardLayout ? JSON.parse(settings.dashboardLayout) : undefined,
        kpiSelection: settings.kpiSelection ? JSON.parse(settings.kpiSelection) : undefined,
        chartPreferences: settings.chartPreferences ? JSON.parse(settings.chartPreferences) : undefined,
        alertThresholds: settings.alertThresholds ? JSON.parse(settings.alertThresholds) : undefined,
      },
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      {
        error: "Failed to update settings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
