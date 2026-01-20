/**
 * Meta Ads Daily Metrics API
 * GET: Fetch daily time-series metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { requireAccountOwnership } from '@/lib/meta-ads/ownership';
import { MetaAdsService } from '@/lib/meta-ads/service';

/**
 * GET /api/meta-ads/metrics/daily
 * Fetch daily metrics (time-series data)
 *
 * Query params:
 * - accountId: Meta Ad Account ID (required)
 * - startDate: YYYY-MM-DD (required)
 * - endDate: YYYY-MM-DD (required)
 * - level: 'account' | 'campaign' | 'adset' | 'ad' (optional, default: 'account')
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
    const level = searchParams.get('level') as 'account' | 'campaign' | 'adset' | 'ad' | null;

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

    // Fetch daily metrics
    const metrics = await service.getDailyMetrics({
      startDate,
      endDate,
      level: level || 'account',
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Failed to fetch daily metrics:', error);

    if (error instanceof Error && error.message.includes('do not have access')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch daily metrics' },
      { status: 500 }
    );
  }
}
