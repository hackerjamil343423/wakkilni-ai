-- Migration: Add Streampay payment provider support
-- This migration adds support for Streampay as a third payment provider

-- Add Streampay-specific columns to subscription table (nullable for backward compatibility)
ALTER TABLE "subscription" ADD COLUMN "streampaySubscriptionId" text;
ALTER TABLE "subscription" ADD COLUMN "streampayConsumerId" text;
ALTER TABLE "subscription" ADD COLUMN "streampayPaymentLinkId" text;

-- Create index on Streampay subscription ID for webhook lookups
CREATE INDEX "subscription_streampaySubscriptionId_idx" ON "subscription"("streampaySubscriptionId") WHERE "streampaySubscriptionId" IS NOT NULL;
