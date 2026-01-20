/**
 * Meta Ads Funnel Analysis API
 * GET: Fetch conversion funnel data
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { requireAccountOwnership } from '@/lib/meta-ads/ownership';
import { MetaAdsService } from '@/lib/meta-ads/service';

/**
 * GET /api/meta-ads/insights/funnel
 * Fetch conversion funnel data
 *
 * Query params:
 * - accountId: Meta Ad Account ID (required)
 * - startDate: YYYY-MM-DD (required)
 * - endDate: YYYY-MM-DD (required)
 *
 * Returns 5-stage funnel:
 * Impressions → Clicks → Page Views → Leads → Purchases
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!accountId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Account ID, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Verify account ownership
    await requireAccountOwnership(session.user.id, accountId);

    // Initialize service
    const service = new MetaAdsService({
      userId: session.user.id,
      accountId,
    });

    // Fetch daily metrics to build funnel
    const metrics = await service.getDailyMetrics({
      startDate,
      endDate,
      level: 'account',
    });

    // Aggregate metrics across the date range
    const totals = metrics.reduce(
      (acc: { impressions: number; clicks: number; linkClicks: number; leads: number; purchases: number }, day: any) => ({
        impressions: acc.impressions + day.impressions,
        clicks: acc.clicks + day.clicks,
        linkClicks: acc.linkClicks + day.linkClicks,
        leads: acc.leads + day.leads,
        purchases: acc.purchases + day.purchases,
      }),
      { impressions: 0, clicks: 0, linkClicks: 0, leads: 0, purchases: 0 }
    );

    // Build 5-stage funnel
    const funnel = [
      {
        stage: 'IMPRESSIONS',
        stageOrder: 1,
        count: totals.impressions,
        dropoffRate: null,
        conversionRate: '100',
      },
      {
        stage: 'CLICKS',
        stageOrder: 2,
        count: totals.clicks,
        dropoffRate: totals.impressions > 0
          ? (((totals.impressions - totals.clicks) / totals.impressions) * 100).toFixed(2)
          : '0',
        conversionRate: totals.impressions > 0
          ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
          : '0',
      },
      {
        stage: 'PAGE_VIEWS',
        stageOrder: 3,
        count: totals.linkClicks,
        dropoffRate: totals.clicks > 0
          ? (((totals.clicks - totals.linkClicks) / totals.clicks) * 100).toFixed(2)
          : '0',
        conversionRate: totals.impressions > 0
          ? ((totals.linkClicks / totals.impressions) * 100).toFixed(2)
          : '0',
      },
      {
        stage: 'LEADS',
        stageOrder: 4,
        count: totals.leads,
        dropoffRate: totals.linkClicks > 0
          ? (((totals.linkClicks - totals.leads) / totals.linkClicks) * 100).toFixed(2)
          : '0',
        conversionRate: totals.impressions > 0
          ? ((totals.leads / totals.impressions) * 100).toFixed(2)
          : '0',
      },
      {
        stage: 'PURCHASES',
        stageOrder: 5,
        count: totals.purchases,
        dropoffRate: totals.leads > 0
          ? (((totals.leads - totals.purchases) / totals.leads) * 100).toFixed(2)
          : '0',
        conversionRate: totals.impressions > 0
          ? ((totals.purchases / totals.impressions) * 100).toFixed(2)
          : '0',
      },
    ];

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error('Failed to fetch funnel data:', error);

    if (error instanceof Error && error.message.includes('do not have access')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch funnel data' },
      { status: 500 }
    );
  }
}
