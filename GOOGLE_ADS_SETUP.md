# Google Ads API Setup Guide

This guide will help you set up Google Ads API integration for your application.

## Prerequisites

1. A Google Ads account
2. Access to Google Cloud Console
3. Node.js and npm installed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Ads API** for your project

## Step 2: Create OAuth 2.0 Credentials

1. In Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
5. Copy the **Client ID** and **Client Secret**
6. Update your `.env` file:
   ```
   GOOGLE_ADS_CLIENT_ID=your_client_id_here
   GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
   ```

## Step 3: Apply for a Developer Token

1. Sign in to your **Google Ads Manager account** (MCC account)
2. Go to **Tools & Settings** > **Setup** > **API Center**
3. Click **Apply for API access**
4. Fill out the application form with:
   - Purpose of using the API
   - Expected monthly API call volume
   - Description of your application
5. Submit the application
6. Wait for approval (usually 1-2 business days)
7. Once approved, copy your **Developer Token**
8. Update your `.env` file:
   ```
   GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
   ```

## Step 4: Get Your Login Customer ID

1. Sign in to your Google Ads Manager account
2. Look at the URL or account selector
3. Your customer ID is the 10-digit number (without dashes)
4. Update your `.env` file:
   ```
   GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890
   ```

## Step 5: Set Up Database

1. Run database migrations to create the necessary tables:
   ```bash
   npm run db:push
   ```

2. This will create the following tables:
   - `google_ads_tokens` - Stores OAuth tokens
   - `cached_campaigns` - Caches campaign data
   - `cached_ad_groups` - Caches ad group data
   - `cached_keywords` - Caches keyword data
   - `cached_daily_metrics` - Caches daily performance metrics
   - `cached_recommendations` - Caches AI recommendations
   - `cached_geo_performance` - Caches geographic data
   - `api_request_logs` - Logs API requests for debugging

## Step 6: Install Required Dependencies

Install the Google Ads API library:

```bash
npm install google-ads-api
```

## Step 7: Implement OAuth Flow

To connect a user's Google Ads account:

1. Create an OAuth authorization URL
2. Redirect the user to Google for authorization
3. Handle the callback and exchange the authorization code for tokens
4. Store the refresh token in the database

Example OAuth flow implementation:

```typescript
// app/api/google-ads/oauth/authorize/route.ts
import { GoogleAdsApi } from "google-ads-api";

export async function GET() {
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  });

  const authUrl = client.getOAuthUrl({
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/google-ads/oauth/callback`,
    scope: "https://www.googleapis.com/auth/adwords",
  });

  return Response.redirect(authUrl);
}
```

```typescript
// app/api/google-ads/oauth/callback/route.ts
import { GoogleAdsApi } from "google-ads-api";
import { db } from "@/db";
import { googleAdsTokens } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("Missing authorization code", { status: 400 });
  }

  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  });

  const tokens = await client.getAccessTokenFromCode(code, {
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/google-ads/oauth/callback`,
  });

  // Store tokens in database
  await db.insert(googleAdsTokens).values({
    userId: "current_user_id", // Get from session
    customerId: "customer_id_from_user", // Need to get from user input
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    scope: tokens.scope,
  });

  return Response.redirect("/dashboard/google-ads");
}
```

## Step 8: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Google Ads dashboard
3. Click "Connect Google Ads Account"
4. Authorize the application
5. Start fetching campaign data!

## API Rate Limits

Be aware of Google Ads API rate limits:

- **Basic access**: 15,000 operations per day
- **Standard access**: 1,500,000 operations per day (requires application)

The application implements caching to minimize API calls:
- Campaign data: 1 hour cache
- Metrics data: 30 minutes cache
- Recommendations: 2 hours cache

## Troubleshooting

### Error: "Invalid developer token"
- Make sure your developer token is approved
- Check that you're using the token from your manager account

### Error: "User doesn't have permission"
- Ensure the user has granted access to their Google Ads account
- Check that the refresh token is valid and not expired

### Error: "Customer ID is invalid"
- Remove dashes from the customer ID
- Ensure you're using the correct customer ID format (10 digits)

### Error: "Quota exceeded"
- Implement request throttling
- Use cached data when possible
- Apply for standard access if needed

## Security Best Practices

1. **Never commit** `.env` files to version control
2. **Rotate** credentials regularly
3. **Use HTTPS** in production
4. **Validate** all user inputs
5. **Log** API requests for monitoring
6. **Encrypt** refresh tokens in the database

## Additional Resources

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [OAuth 2.0 Guide](https://developers.google.com/google-ads/api/docs/oauth/overview)
- [API Reference](https://developers.google.com/google-ads/api/reference/rpc/v16/overview)
- [Best Practices](https://developers.google.com/google-ads/api/docs/best-practices)

## Support

If you encounter issues:
1. Check the API request logs in your database
2. Review the Google Ads API error codes
3. Consult the Google Ads API support forum
4. Contact Google Ads API support

## Next Steps

Once your integration is working:

1. Implement more advanced features:
   - Search term analysis
   - Automated bid adjustments
   - Performance anomaly detection
   - Custom reporting

2. Optimize performance:
   - Implement batch requests
   - Use field projections
   - Cache aggressively
   - Monitor API usage

3. Add business logic:
   - Budget pacing alerts
   - Performance notifications
   - Automated optimizations
   - Custom dashboards
