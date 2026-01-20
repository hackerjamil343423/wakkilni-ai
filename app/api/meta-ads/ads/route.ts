/**
 * Meta Ads Ads API
 * GET: Fetch ads with performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { requireAccountOwnership } from '@/lib/meta-ads/ownership';
import { MetaAdsService } from '@/lib/meta-ads/service';

/**
 * GET /api/meta-ads/ads
 * Fetch ads with metrics
 *
 * Query params:
 * - accountId: Meta Ad Account ID (required)
 * - startDate: YYYY-MM-DD (optional)
 * - endDate: YYYY-MM-DD (optional)
 * - status: Comma-separated statuses (optional)
 * - campaignIds: Comma-separated campaign IDs (optional)
 * - adSetIds: Comma-separated ad set IDs (optional)
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
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const statusParam = searchParams.get('status');
    const campaignIdsParam = searchParams.get('campaignIds');
    const adSetIdsParam = searchParams.get('adSetIds');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Verify account ownership
    await requireAccountOwnership(session.user.id, accountId);

    // Parse filters
    const status = statusParam ? statusParam.split(',') : undefined;
    const campaignIds = campaignIdsParam ? campaignIdsParam.split(',') : undefined;
    const adSetIds = adSetIdsParam ? adSetIdsParam.split(',') : undefined;

    // Initialize service
    const service = new MetaAdsService({
      userId: session.user.id,
      accountId,
    });

    // Fetch ads
    const ads = await service.getAds({
      startDate,
      endDate,
      status,
      campaignIds,
      adSetIds,
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Failed to fetch ads:', error);

    if (error instanceof Error && error.message.includes('do not have access')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}
