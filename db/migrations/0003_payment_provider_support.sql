-- Migration: Add payment provider support
-- This migration adds support for dual payment providers (Polar and Paymob)

-- Add country column to user table for regional provider detection
ALTER TABLE "user" ADD COLUMN "country" text;

-- Add payment provider tracking columns to subscription table
ALTER TABLE "subscription" ADD COLUMN "paymentProvider" text NOT NULL DEFAULT 'polar';

-- Add Paymob-specific columns (nullable for backward compatibility)
ALTER TABLE "subscription" ADD COLUMN "paymobIntentionId" text;
ALTER TABLE "subscription" ADD COLUMN "paymobSubscriptionPlanId" integer;
ALTER TABLE "subscription" ADD COLUMN "paymobCustomerId" text;

-- Create index on payment provider for faster queries
CREATE INDEX "subscription_paymentProvider_idx" ON "subscription"("paymentProvider");

-- Create index on Paymob intention ID for webhook lookups
CREATE INDEX "subscription_paymobIntentionId_idx" ON "subscription"("paymobIntentionId") WHERE "paymobIntentionId" IS NOT NULL;
