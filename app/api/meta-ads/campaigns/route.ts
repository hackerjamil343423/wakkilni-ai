/**
 * Meta Ads Campaigns API
 * GET: Fetch campaigns with performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { requireAccountOwnership } from '@/lib/meta-ads/ownership';
import { MetaAdsService } from '@/lib/meta-ads/service';

/**
 * GET /api/meta-ads/campaigns
 * Fetch campaigns with metrics
 *
 * Query params:
 * - accountId: Meta Ad Account ID (required)
 * - startDate: YYYY-MM-DD (optional)
 * - endDate: YYYY-MM-DD (optional)
 * - status: Comma-separated statuses (optional, e.g., "ACTIVE,PAUSED")
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

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Verify account ownership
    await requireAccountOwnership(session.user.id, accountId);

    // Parse status filter
    const status = statusParam ? statusParam.split(',') : undefined;

    // Initialize service
    const service = new MetaAdsService({
      userId: session.user.id,
      accountId,
    });

    // Fetch campaigns
    const campaigns = await service.getCampaigns({
      startDate,
      endDate,
      status,
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);

    if (error instanceof Error && error.message.includes('do not have access')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
