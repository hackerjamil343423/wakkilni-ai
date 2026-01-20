/**
 * Meta Ads Geographic Performance API
 * GET: Fetch performance metrics by country/region/city
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { requireAccountOwnership } from '@/lib/meta-ads/ownership';
import { MetaAdsService } from '@/lib/meta-ads/service';

/**
 * GET /api/meta-ads/insights/geo
 * Fetch geographic performance data
 *
 * Query params:
 * - accountId: Meta Ad Account ID (required)
 * - startDate: YYYY-MM-DD (required)
 * - endDate: YYYY-MM-DD (required)
 * - breakdowns: Comma-separated (optional, default: 'country')
 *   Options: 'country', 'region', 'dma' (city)
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
    const breakdownsParam = searchParams.get('breakdowns');

    if (!accountId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Account ID, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Verify account ownership
    await requireAccountOwnership(session.user.id, accountId);

    // Parse breakdowns
    const breakdowns = breakdownsParam ? breakdownsParam.split(',') : ['country'];

    // Initialize service
    const service = new MetaAdsService({
      userId: session.user.id,
      accountId,
    });

    // Fetch geo performance
    const geoPerformance = await service.getGeoPerformance({
      startDate,
      endDate,
      breakdowns,
    });

    return NextResponse.json({ geoPerformance });
  } catch (error) {
    console.error('Failed to fetch geo performance:', error);

    if (error instanceof Error && error.message.includes('do not have access')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch geo performance' },
      { status: 500 }
    );
  }
}
