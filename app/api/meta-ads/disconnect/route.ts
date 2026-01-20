/**
 * Meta Ads Disconnect API
 * DELETE: Disconnect one or all Meta ad accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { metaAdsAccount } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revokeToken } from '@/lib/meta-ads/oauth-client';
import { logAccountDisconnected } from '@/lib/meta-ads/audit-log';
import { invalidateAccountCache } from '@/lib/meta-ads/cache';

/**
 * DELETE /api/meta-ads/disconnect
 * Disconnect Meta ad account(s)
 *
 * Query params:
 * - accountId: Specific account to disconnect (optional)
 * - all: If 'true', disconnect all accounts (optional)
 */
export async function DELETE(request: NextRequest) {
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
    const disconnectAll = searchParams.get('all') === 'true';

    // Get request headers for audit log
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;
    const userAgent = headersList.get('user-agent') || undefined;

    if (disconnectAll) {
      // Disconnect all accounts
      const accounts = await db
        .select()
        .from(metaAdsAccount)
        .where(eq(metaAdsAccount.userId, session.user.id));

      // Revoke tokens and delete accounts
      await Promise.all(
        accounts.map(async (account) => {
          try {
            // Revoke token at Meta
            if (account.accessToken) {
              await revokeToken(account.accessToken);
            }

            // Invalidate cache
            await invalidateAccountCache(account.id);

            // Log disconnection
            await logAccountDisconnected(
              session.user.id,
              account.accountId,
              account.accountName,
              ipAddress,
              userAgent
            );
          } catch (error) {
            console.error(`Failed to revoke token for account ${account.accountId}:`, error);
            // Continue with deletion even if revocation fails
          }
        })
      );

      // Delete from database (cascade will delete related data)
      await db
        .delete(metaAdsAccount)
        .where(eq(metaAdsAccount.userId, session.user.id));

      return NextResponse.json({
        success: true,
        disconnectedCount: accounts.length,
      });
    } else if (accountId) {
      // Disconnect specific account
      const account = await db
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

      if (!account || account.length === 0) {
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        );
      }

      const accountData = account[0];

      try {
        // Revoke token at Meta
        if (accountData.accessToken) {
          await revokeToken(accountData.accessToken);
        }

        // Invalidate cache
        await invalidateAccountCache(accountData.id);

        // Log disconnection
        await logAccountDisconnected(
          session.user.id,
          accountData.accountId,
          accountData.accountName,
          ipAddress,
          userAgent
        );
      } catch (error) {
        console.error(`Failed to revoke token for account ${accountData.accountId}:`, error);
        // Continue with deletion even if revocation fails
      }

      // Delete from database
      await db
        .delete(metaAdsAccount)
        .where(eq(metaAdsAccount.id, accountData.id));

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Either accountId or all=true must be specified' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Failed to disconnect account:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect account' },
      { status: 500 }
    );
  }
}
