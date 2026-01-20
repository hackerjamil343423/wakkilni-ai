/**
 * Meta Ads Account Connection API
 * POST: Connect selected ad account(s) after OAuth
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { metaAdsAccount } from '@/db/schema';
import { nanoid } from 'nanoid';
import { logAccountConnected } from '@/lib/meta-ads/audit-log';

/**
 * POST /api/meta-ads/accounts/connect
 * Connect selected Meta ad accounts (used for multi-account selection)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { accessToken, expiresAt, selectedAccounts } = body;

    if (!accessToken || !expiresAt || !selectedAccounts || !Array.isArray(selectedAccounts)) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (selectedAccounts.length === 0) {
      return NextResponse.json(
        { error: 'No accounts selected' },
        { status: 400 }
      );
    }

    // Get request headers for audit log
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;
    const userAgent = headersList.get('user-agent') || undefined;

    // Insert all selected accounts
    const accountsToInsert = selectedAccounts.map((account: any, index: number) => ({
      id: nanoid(),
      userId: session.user.id,
      accountId: account.id,
      accountName: account.name,
      businessId: account.businessId || null,
      accessToken,
      tokenExpiresAt: new Date(expiresAt),
      scope: 'ads_read,ads_management,business_management',
      currency: account.currency || null,
      timezone: account.timezone || null,
      isPrimary: index === 0, // First account is primary
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(metaAdsAccount).values(accountsToInsert);

    // Log connections
    await Promise.all(
      selectedAccounts.map((account: any) =>
        logAccountConnected(
          session.user.id,
          account.id,
          account.name,
          ipAddress,
          userAgent
        )
      )
    );

    return NextResponse.json({
      success: true,
      connectedCount: selectedAccounts.length,
    });
  } catch (error) {
    console.error('Failed to connect accounts:', error);
    return NextResponse.json(
      { error: 'Failed to connect accounts' },
      { status: 500 }
    );
  }
}
