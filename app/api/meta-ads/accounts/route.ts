/**
 * Meta Ads Accounts Management API
 * GET: List connected accounts
 * PATCH: Update account settings (name, label, primary)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getUserAccounts } from '@/lib/meta-ads/ownership';
import { db } from '@/db';
import { metaAdsAccount } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/meta-ads/accounts
 * List all connected Meta Ads accounts for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accounts = await getUserAccounts(session.user.id);

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/meta-ads/accounts
 * Update account settings (account label, primary status)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { accountId, accountLabel, isPrimary } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingAccount = await db
      .select()
      .from(metaAdsAccount)
      .where(
        and(
          eq(metaAdsAccount.userId, session.user.id),
          accountId.startsWith('act_')
            ? eq(metaAdsAccount.accountId, accountId)
            : eq(metaAdsAccount.id, accountId)
        )
      )
      .limit(1);

    if (!existingAccount || existingAccount.length === 0) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const account = existingAccount[0];

    // If setting as primary, unset all other accounts as primary first
    if (isPrimary === true) {
      await db
        .update(metaAdsAccount)
        .set({ isPrimary: false })
        .where(eq(metaAdsAccount.userId, session.user.id));
    }

    // Update account
    const updates: any = {
      updatedAt: new Date(),
    };

    if (accountLabel !== undefined) {
      updates.accountLabel = accountLabel;
    }

    if (isPrimary !== undefined) {
      updates.isPrimary = isPrimary;
    }

    await db
      .update(metaAdsAccount)
      .set(updates)
      .where(eq(metaAdsAccount.id, account.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update account:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
}
