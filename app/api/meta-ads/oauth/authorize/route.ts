/**
 * Meta Ads OAuth Authorization Endpoint
 * Redirects user to Meta's consent screen
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { generateAuthUrl } from '@/lib/meta-ads/oauth-client';

export async function GET() {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate Meta OAuth URL with user ID as state (for CSRF protection)
    const authUrl = await generateAuthUrl(session.user.id);

    // Redirect to Meta consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
