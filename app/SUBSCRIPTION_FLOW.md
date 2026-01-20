# Subscription & Payment Process Flow Documentation

## 📋 Table of Contents
1. [Technology Stack](#technology-stack)
2. [User Journey](#user-journey)
3. [Checkout Process](#checkout-process)
4. [Webhook Processing](#webhook-processing)
5. [Status Checking](#subscription-status-check)
6. [Managing Subscriptions](#managing-subscriptions)
7. [Current Plans](#current-plans-configuration)
8. [Access Control](#access-control-logic)
9. [Database Schema](#database-schema)
10. [Environment Variables](#environment-variables-required)
11. [API Endpoints](#api-endpoints)
12. [Critical Flow Points](#critical-flow-points)

---

## Technology Stack

- **Payment Provider:** Polar.sh (sandbox mode)
- **Auth Integration:** Better Auth with Polar plugin
- **Database:** PostgreSQL (Neon) via Drizzle ORM
- **Auth Client:** `@polar-sh/better-auth`

### Key Files
- `lib/auth.ts` - Better Auth configuration with Polar webhooks
- `lib/subscription.ts` - Subscription query helpers
- `app/api/subscription/route.ts` - Subscription status endpoint
- `app/pricing/page.tsx` - Pricing page (server component)
- `app/pricing/_component/pricing-table.tsx` - Pricing UI (client component)
- `app/dashboard/payment/page.tsx` - Payment management page
- `db/schema.ts` - Database schema definitions

---

## User Journey

### 1. Registration & Account Creation

```
┌─────────────────────────┐
│ User visits /sign-up    │
│ or /sign-in             │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Google OAuth Sign-in    │ (lib/auth.ts:44-48)
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ Better Auth creates:            │
│ • User record in DB             │
│ • Session token (cookie)        │
│ • Polar customer account        │ (lib/auth.ts:53)
│   (auto via createCustomer)     │
└─────────────────────────────────┘
```

**Process:**
1. User authenticates with Google
2. Better Auth stores user in database (db/schema.ts:11-19)
3. Polar plugin auto-creates customer with externalId = userId

---

### 2. Viewing Pricing Plans

```
┌──────────────────────────┐
│ User visits /pricing     │ (app/pricing/page.tsx)
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ Server fetches subscription      │
│ details for logged-in user       │ (getSubscriptionDetails())
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ PricingTable renders:            │
│                                  │
│ ┌──────────────────────────────┐ │
│ │  STARTER PLAN                │ │
│ │  $1,000/month                │ │
│ │                              │ │
│ │  Features:                   │ │
│ │  ✓ 5 Projects                │ │
│ │  ✓ 10GB Storage              │ │
│ │  ✓ 1 Team Member             │ │
│ │  ✓ Email Support             │ │
│ │                              │ │
│ │  [Get Started Button]         │ │
│ │   OR                          │ │
│ │  [Manage Subscription Button] │ │
│ │  (if already subscribed)      │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

**Status Detection:**
- If user has active subscription → "Manage Subscription" button
- If user has no subscription → "Get Started" button
- If user not logged in → "Sign In to Get Started" button

---

## Checkout Process

### Complete Flow

```
User clicks "Get Started" button
          │
          ▼
┌─────────────────────────────────┐
│ Check Authentication            │
├─────────────────────────────────┤
│ NOT SIGNED IN?                  │
│  → Redirect to /sign-in         │
│                                 │
│ SIGNED IN?                      │
│  → Continue to checkout         │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ handleCheckout() Called         │ (pricing-table.tsx:61-77)
│                                 │
│ Parameters:                     │
│ • productId: NEXT_PUBLIC_       │
│   STARTER_TIER (env var)        │
│ • slug: "starter"               │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ authClient.checkout() invoked   │
│                                 │
│ Returns:                        │
│ • Polar checkout URL            │
│ • Session ID                    │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ User Redirected to Polar        │
│ (Hosted Checkout Page)          │
│                                 │
│ User provides:                  │
│ • Email                         │
│ • Card details                  │
│ • Billing address               │
│ • Accept terms                  │
└──────────┬──────────────────────┘
           │
      ┌────┴─────────┐
      │              │
    Success        Cancel
      │              │
      ▼              ▼
┌───────────┐   ┌──────────────┐
│ Polar     │   │ Redirect to  │
│ processes │   │ /pricing     │
│ payment   │   │ (no purchase)│
│           │   └──────────────┘
│ ✓ Charged │
│ ✓ Creates │
│   sub ID  │
└─────┬─────┘
      │
      ▼
┌──────────────────────────┐
│ WEBHOOK TRIGGERED        │ ⚠️ CRITICAL
│ "subscription.created"   │
│ or                       │
│ "subscription.active"    │
└────────┬─────────────────┘
         │
    (See Webhook Processing below)
         │
         ▼
┌──────────────────────────────┐
│ Redirect to successUrl:      │
│ /success?checkout_id={ID}    │
│                              │
│ (NEXT_PUBLIC_APP_URL setting)│
└──────────────────────────────┘
```

**Key Points:**
- Checkout is hosted by Polar (not in-app)
- Payment processing happens on Polar's servers
- Success/cancel URLs configured in environment
- Webhook must succeed for subscription to be recorded in app DB

---

## Webhook Processing

### Critical: Subscription Sync Mechanism

```
Polar.sh Sends Webhook
       │
       ▼
┌─────────────────────────────────────┐
│ Better Auth Webhook Handler         │
│ (lib/auth.ts:79-186)                │
│                                     │
│ Triggered on events:                │
│ • subscription.created              │
│ • subscription.active               │
│ • subscription.updated              │
│ • subscription.canceled             │
│ • subscription.revoked              │
│ • subscription.uncanceled           │
└──────────┬────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ STEP 1: Verify Webhook Signature    │
│ Using: POLAR_WEBHOOK_SECRET         │
│ (Security: Prevent spoofing)        │
└──────────┬────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ STEP 2: Extract User ID             │
│                                     │
│ From: data.customer?.externalId     │
│ (Matches userId created at signup)  │
│                                     │
│ If missing: userId = null           │
│ (Subscription created but not       │
│  linked to user account)            │
└──────────┬────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ STEP 3: Build Subscription Object   │
│                                     │
│ {                                   │
│   id: data.id,                      │
│   userId: data.customer.externalId, │
│   status: data.status,              │
│   amount: data.amount,              │
│   currency: data.currency,          │
│   recurringInterval: ...,           │
│   productId: data.productId,        │
│   currentPeriodStart: ...,          │
│   currentPeriodEnd: ...,            │
│   cancelAtPeriodEnd: ...,           │
│   ... (13 total fields)             │
│ }                                   │
└──────────┬────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ STEP 4: Upsert to Database          │
│                                     │
│ db.insert(subscription)             │
│   .values(subscriptionData)         │
│   .onConflictDoUpdate({             │
│     target: subscription.id,        │
│     set: {...all fields...}         │
│   })                                │
│                                     │
│ (Create if new, update if exists)   │
└──────────┬────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ ✅ Subscription Synced!             │
│                                     │
│ Logged:                             │
│ • "🎯 Processing subscription ..."  │
│ • "💾 Final subscription data ..."  │
│ • "✅ Upserted subscription ..."    │
│                                     │
│ Exception Handling:                 │
│ • Errors logged but don't fail      │
│ • Webhook succeeds anyway           │
│ • Prevents infinite Polar retries   │
└─────────────────────────────────────┘
```

### Webhook Failure Scenario

```
If Webhook Handler Throws Error:
  │
  ├─→ Polar catches error
  ├─→ Marks webhook as failed
  ├─→ Retries webhook (exponential backoff)
  └─→ Eventually marks as failed permanently
      → User subscription exists in Polar
      → But NOT synced to app database
      → User can't access premium features

SOLUTION: Always handle webhook errors
gracefully and return 200 OK
```

---

## Subscription Status Check

### Query Logic Flow

```
getSubscriptionDetails() called
(lib/subscription.ts:28-109)
        │
        ▼
┌──────────────────────────────┐
│ 1. Get session user ID       │
└──────────┬───────────────────┘
           │
      ┌────┴────┐
      │         │
   Exists     Null
      │         │
      ▼         ▼
 Continue   Return:
            {hasSubscription: false}
      │
      ▼
┌──────────────────────────────┐
│ 2. Query all subscriptions   │
│    for this userId           │
└──────────┬───────────────────┘
           │
      ┌────┴────┐
      │         │
   Found     None
      │         │
      ▼         ▼
 Continue   Return:
            {hasSubscription: false}
      │
      ▼
┌──────────────────────────────┐
│ 3. Filter status = "active"  │
│    Sort by createdAt DESC    │
└──────────┬───────────────────┘
           │
      ┌────┴────┐
      │         │
   Found     None
      │         │
      ▼         ▼
 Return:    Check latest
 {          (step 4)
  hasSubscription: true,
  subscription: {...}
 }
      │
      ▼
┌──────────────────────────────┐
│ 4. Check expired/canceled    │
│                              │
│ Is now > currentPeriodEnd?   │
│ → EXPIRED                    │
│                              │
│ Is status = "canceled"?      │
│ → CANCELED                   │
│                              │
│ Return with error details    │
└──────────────────────────────┘
```

### Helper Functions

```typescript
// Check if user has ANY active subscription
isUserSubscribed(): boolean
→ Returns: true | false

// Check if user has access to specific tier
hasAccessToProduct(productId: string): boolean
→ Returns: true if subscribed to productId

// Get detailed subscription status
getUserSubscriptionStatus(): "active" | "canceled" | "expired" | "none"
→ Used for permission checks
```

---

## Managing Subscriptions

### User Subscription Management Page

**Location:** `/dashboard/payment`

```
User visits /dashboard/payment
         │
         ▼
┌─────────────────────────────────┐
│ Check: Has active subscription? │
└────────┬────────────────────────┘
         │
    ┌────┴────────┐
    │             │
   YES            NO
    │             │
    ▼             ▼
┌────────────┐  ┌──────────────────┐
│ Show sub   │  │ Show Paywall:    │
│ details:   │  │                  │
│            │  │ 🔒 Subscription  │
│ • Status   │  │    Required      │
│ • Amount   │  │                  │
│ • Interval │  │ "You need an     │
│ • Period   │  │  active sub to   │
│   end      │  │  access payment  │
│            │  │  features"       │
│ • Cancel   │  │                  │
│   notice   │  │ [Subscribe Now] ←┐
│   (if any) │  │      Button      │
│            │  │                  │
│ [Manage    │  │ (Content blurred)│
│  Button]   │  │                  │
└────┬───────┘  └──────────────────┘
     │
     ▼
authClient.customer.portal()
     │
     ▼
┌──────────────────────────────┐
│ Polar Customer Portal Opens  │
│ (In new tab/window)          │
│                              │
│ User can:                    │
│ • Update payment method      │
│ • View billing history       │
│ • Download invoices          │
│ • Cancel subscription        │
│ • Update billing address     │
│ • Change plan (if available) │
└────────┬─────────────────────┘
         │
    (If user cancels subscription)
         │
         ▼
┌──────────────────────────────┐
│ WEBHOOK: subscription.canceled
│ (or subscription.revoked)    │
│                              │
│ Updates DB:                  │
│ • status = "canceled"        │
│ • canceledAt = now           │
│ • cancelAtPeriodEnd = true   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Page refresh shows:          │
│ "Subscription cancelled"     │
│ "Expires on [date]"          │
│ New option to resubscribe    │
└──────────────────────────────┘
```

---

## Current Plans Configuration

### Starter Tier (Only Plan Currently Active)

| Property | Value |
|----------|-------|
| **Name** | Starter |
| **Monthly Price** | $1,000 |
| **Billing Period** | Monthly (recurring) |
| **Product ID** | `NEXT_PUBLIC_STARTER_TIER` (env var: `b626ee0f-90cf-4b42-8764-fd59149beb61`) |
| **Slug** | `NEXT_PUBLIC_STARTER_SLUG` (env var: `starter`) |

### Included Features
```
✓ 5 Projects
✓ 10GB Storage
✓ 1 Team Member
✓ Email Support
```

### Adding New Plans

To add additional plans (Pro, Enterprise, etc.):

1. **Create product in Polar.sh dashboard**
   - Get product ID and slug

2. **Add to Better Auth config** (lib/auth.ts:56-73)
   ```typescript
   products: [
     { productId: "pro-tier-id", slug: "pro" },
     { productId: "enterprise-id", slug: "enterprise" },
   ]
   ```

3. **Add pricing card** (app/pricing/_component/pricing-table.tsx)
   ```typescript
   const PRO_TIER = process.env.NEXT_PUBLIC_PRO_TIER;
   // Add new Card component for Pro plan
   ```

4. **Add environment variables**
   ```
   NEXT_PUBLIC_PRO_TIER="pro-tier-uuid"
   NEXT_PUBLIC_PRO_SLUG="pro"
   ```

---

## Access Control Logic

### Permission Checking Patterns

```typescript
// Pattern 1: Simple subscription check
const subscriptionDetails = await getSubscriptionDetails();
if (!subscriptionDetails.hasSubscription) {
  // Show paywall
}

// Pattern 2: Specific tier check
const hasProAccess = await hasAccessToProduct(PRO_TIER_ID);
if (!hasProAccess) {
  return NextResponse.json({error: "Upgrade required"}, {status: 403});
}

// Pattern 3: Status check
const status = await getUserSubscriptionStatus();
if (status !== "active") {
  // Redirect to pricing or show error
}
```

### Implementation Examples

**Payment Page** (app/dashboard/payment/page.tsx)
- Checks: `!hasSubscription || status !== "active"`
- Action: Show paywall modal with blur effect

**Pricing Page** (app/pricing/_component/pricing-table.tsx)
- Checks: `isCurrentPlan(tierProductId)`
- Action: Show "Current Plan" badge

---

## Database Schema

### Subscription Table

```sql
CREATE TABLE subscription (
  -- Identifiers
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES user(id),

  -- Product & Pricing
  productId TEXT NOT NULL,
  amount INTEGER NOT NULL,        -- In cents (e.g., 100000 = $1000)
  currency TEXT NOT NULL,         -- ISO code (USD, EUR, etc.)
  recurringInterval TEXT NOT NULL,-- "month", "year", etc.

  -- Status
  status TEXT NOT NULL,           -- active, canceled, revoked, etc.
  cancelAtPeriodEnd BOOLEAN DEFAULT FALSE,
  canceledAt TIMESTAMP,
  customerCancellationReason TEXT,
  customerCancellationComment TEXT,

  -- Billing Periods
  currentPeriodStart TIMESTAMP NOT NULL,
  currentPeriodEnd TIMESTAMP NOT NULL,
  startedAt TIMESTAMP NOT NULL,
  endsAt TIMESTAMP,
  endedAt TIMESTAMP,

  -- Polar References
  customerId TEXT NOT NULL,       -- Polar customer ID
  checkoutId TEXT NOT NULL,       -- Checkout session ID
  discountId TEXT,                -- Applied discount (if any)

  -- Custom Data
  metadata TEXT,                  -- JSON string
  customFieldData TEXT,           -- JSON string

  -- Timestamps
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  modifiedAt TIMESTAMP
);
```

### Key Relationships
```
subscription.userId → user.id (FK)
subscription.productId → Polar (External reference)
subscription.customerId → Polar (External reference)
```

### Querying Examples

```typescript
// Get user's active subscription
const active = await db
  .select()
  .from(subscription)
  .where(
    and(
      eq(subscription.userId, userId),
      eq(subscription.status, "active")
    )
  )
  .orderBy(desc(subscription.createdAt))
  .limit(1);

// Get all subscriptions (for analytics)
const all = await db
  .select()
  .from(subscription)
  .where(eq(subscription.userId, userId));

// Check if subscription is expired
const now = new Date();
const isExpired = new Date(sub.currentPeriodEnd) < now;
```

---

## Environment Variables Required

### Polar Configuration
```bash
# Polar API access token (from Polar dashboard)
POLAR_ACCESS_TOKEN="polar_oat_gneXEKqELdxR4gVTWZe1XAaQbzMG97IBb5NUX20xAUJ"

# Webhook signing secret (for security verification)
POLAR_WEBHOOK_SECRET="polar_whs_wC0ikqZYcv7PuN2Pz7WlQB0zXs649FYpOl2pb2UtYgl"

# Success redirect after checkout
POLAR_SUCCESS_URL="/success?checkout_id={CHECKOUT_ID}"
```

### Product Configuration
```bash
# Starter tier (Required)
NEXT_PUBLIC_STARTER_TIER="b626ee0f-90cf-4b42-8764-fd59149beb61"
NEXT_PUBLIC_STARTER_SLUG="starter"

# Future tiers (Optional)
NEXT_PUBLIC_PRO_TIER="pro-tier-uuid"
NEXT_PUBLIC_PRO_SLUG="pro"
```

### Application Configuration
```bash
# App URL (for redirect and webhook verification)
NEXT_PUBLIC_APP_URL="https://app.wakilni-digital.com"

# Better Auth secret (for session encryption)
BETTER_AUTH_SECRET="gsxbJZl7CbDUjgjKuJYlYjkYDfawY0Pn"
```

### Database Configuration
```bash
# PostgreSQL/Neon database connection
DATABASE_URL="postgresql://neondb_owner:npg_XKuYI1CG4kjD@ep-fragrant-glitter-agtgeyst-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

---

## API Endpoints

### Subscription Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/subscription` | GET | Fetch current user's subscription details | Yes (Session) |
| `/api/auth/[...all]` | * | Better Auth handlers<br>(includes checkout, portal, webhooks) | Mixed |

### Subscription GET Response

```json
{
  "hasSubscription": true,
  "subscription": {
    "id": "sub_xyz123",
    "productId": "b626ee0f-90cf-4b42-8764-fd59149beb61",
    "status": "active",
    "amount": 100000,
    "currency": "usd",
    "recurringInterval": "month",
    "currentPeriodStart": "2025-01-18T00:00:00Z",
    "currentPeriodEnd": "2025-02-18T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "canceledAt": null,
    "organizationId": null
  },
  "error": null,
  "errorType": null
}
```

### Subscription GET Response (No Subscription)

```json
{
  "hasSubscription": false,
  "subscription": null,
  "error": null,
  "errorType": null
}
```

### Subscription GET Response (Canceled)

```json
{
  "hasSubscription": true,
  "subscription": {
    "id": "sub_xyz123",
    "status": "canceled",
    "currentPeriodEnd": "2025-02-18T00:00:00Z",
    ...
  },
  "error": "Subscription has been canceled",
  "errorType": "CANCELED"
}
```

---

## Critical Flow Points

### 🔴 Must Know - High Risk Issues

#### 1. Webhook is Essential for Recording Subscriptions
- **Problem:** User pays → Polar processes payment → App doesn't know about it
- **Reason:** Subscriptions are only recorded in app DB via webhooks
- **Solution:** Ensure webhook handler never crashes, always returns 200 OK
- **Code:** `lib/auth.ts:87-186`

#### 2. External ID Linking
- **Problem:** Subscription created but `userId` is null → Can't check permissions
- **Reason:** `data.customer.externalId` doesn't match `userId`
- **Root Cause:** Missing or misconfigured `createCustomerOnSignUp` in Better Auth
- **Check:** Ensure `polar({ createCustomerOnSignUp: true })` is set
- **Debug:** Log webhook payloads to verify externalId is set

#### 3. Environment Variables Must Match Polar
- **Problem:** Checkout fails → User can't subscribe
- **Reason:** Product IDs or slug don't exist in Polar or config is wrong
- **Debug:** Test product IDs in Polar.sh dashboard first
- **Impact:** Blocks revenue

#### 4. Sandbox vs Production Mode
- **Current:** `server: "sandbox"` (lib/auth.ts:24)
- **Risk:** All payments are fake, won't charge cards
- **Production:** Change to `server: "production"` when going live
- **Critical:** Update in deployment, test thoroughly first

#### 5. Status Check After Period End
- **Problem:** User's access isn't revoked after `currentPeriodEnd`
- **Reason:** App only checks `status === "active"`, not expiration date
- **Current:** getSubscriptionDetails() checks expiration (line 59)
- **But:** Some features might only check `isUserSubscribed()` (simpler check)
- **Fix:** Always use full `getSubscriptionDetails()` for important features

#### 6. Portal Redirect
- **Problem:** User clicks "Manage Subscription" → Nothing happens
- **Reason:** `authClient.customer.portal()` not available or fails silently
- **Debug:** Check browser console for errors
- **Fallback:** Polar portal URL can be generated manually if SDK fails

### ⚠️ Important - Monitor These

1. **Webhook Retry Logic**
   - Polar retries failed webhooks with exponential backoff
   - Eventually marks as failed → Sync is lost
   - Monitor logs for "Error processing subscription webhook"

2. **Customer Portal Experience**
   - Users manage subscriptions in external Polar portal
   - Changes sync back via webhook
   - UX friction if portal is slow

3. **Payment Method Failures**
   - Polar auto-retries failed payments
   - Subscription stays "active" but payment fails
   - Watch for declined card situations

4. **Timezone Handling**
   - All dates stored in UTC
   - Display dates use user's local timezone
   - Payment periods calculated in UTC

---

## Testing the Subscription Flow

### Manual Testing Checklist

- [ ] **Sign up**: New user account created
- [ ] **View pricing**: /pricing loads, shows Starter plan
- [ ] **Checkout**: "Get Started" button → Polar checkout page
- [ ] **Payment**: Complete fake payment with test card
- [ ] **Redirect**: After payment → /success?checkout_id=...
- [ ] **Webhook**: Check app logs for webhook processing
- [ ] **DB check**: Run query to verify subscription record exists
- [ ] **Dashboard**: /dashboard/payment shows subscription details
- [ ] **Access**: Can access premium features
- [ ] **Portal**: "Manage Subscription" button opens Polar portal
- [ ] **Cancel**: Cancel in portal → App reflects change after refresh
- [ ] **Resubscribe**: Can subscribe again after cancellation

### Test Cards (Sandbox Mode)

```
Visa (Success):     4242 4242 4242 4242
Visa (Fail):        4000 0000 0000 0002
Mastercard:         5555 5555 5555 4444

Expiry:             Any future date (MM/YY)
CVC:                Any 3 digits
```

---

## Troubleshooting Guide

### "Subscription Required" Paywall Always Shows

**Check:**
1. Is webhook being received? Check logs for "Processing subscription webhook"
2. Is userId null in webhook? Check external ID sync
3. Is subscription status "active"? Query database:
   ```sql
   SELECT * FROM subscription WHERE user_id = 'user_id' ORDER BY created_at DESC;
   ```
4. Is status "active"? Or "canceled"/"expired"?

**Fix:**
- Verify webhook secret matches `POLAR_WEBHOOK_SECRET`
- Check createCustomerOnSignUp is enabled
- Manually trigger webhook from Polar dashboard if stuck

### "Manage Subscription" Button Does Nothing

**Check:**
1. Is authClient imported correctly?
2. Check browser console for errors
3. Is Polar SDK loaded?

**Fix:**
```typescript
// Debug version:
const handlePortal = async () => {
  try {
    console.log("Opening portal...");
    await authClient.customer.portal();
    console.log("Portal opened successfully");
  } catch (error) {
    console.error("Portal error:", error);
    // Fallback: open Polar portal directly
    window.open(`${polarDashboardUrl}`, "_blank");
  }
};
```

### Payment Completed but Subscription Doesn't Show

**Check:**
1. Check Polar.sh dashboard - does subscription exist there?
2. Check app logs - was webhook received?
3. Check database - is subscription record inserted?

**Likely Cause:** Webhook failed or external ID mismatch

**Fix:**
```sql
-- Check what was recorded
SELECT * FROM subscription WHERE customer_id = 'polar_customer_id';

-- Check if user_id is null
SELECT id, user_id, status FROM subscription WHERE id = 'sub_id';
```

---

## Future Enhancements

### Planned Features
1. **Multiple Plans**: Pro, Enterprise tiers
2. **Discount Codes**: Apply coupons at checkout
3. **Usage-Based Billing**: Metered subscriptions
4. **Team Management**: Manage who has subscription access
5. **Invoice History**: User can download past invoices
6. **Email Notifications**: Renewal, expiration, failure alerts
7. **Upgrade/Downgrade**: Switch plans mid-cycle
8. **Family/Group Plans**: Share subscription with team

### Technical Debt
1. Move Polar to production (not sandbox)
2. Add error handling for portal failures
3. Implement usage tracking for usage-based billing
4. Add webhook retry logic for robustness
5. Cache subscription status to reduce DB queries
6. Add audit log for subscription changes

---

**Last Updated:** 2026-01-18
**Current Status:** Active with Starter plan only
**Payment Provider:** Polar.sh (Sandbox Mode)
**Database:** PostgreSQL/Neon
