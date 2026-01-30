-- Migration: Add admin payment configuration table
-- This migration creates a table for managing payment provider configurations via admin panel

CREATE TABLE "payment_config" (
  "id" text PRIMARY KEY,
  "provider" text NOT NULL UNIQUE,
  "enabled" boolean NOT NULL DEFAULT true,
  "priority" integer NOT NULL DEFAULT 0,
  "supported_countries" text,
  "sandbox_mode" boolean NOT NULL DEFAULT true,
  "api_public_key" text,
  "api_secret_key" text,
  "webhook_url" text,
  "webhook_secret" text,
  "webhook_events" text,
  "last_tested_at" timestamp,
  "last_test_status" text,
  "last_test_message" text,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

-- Create index on provider for fast lookups
CREATE INDEX "payment_config_provider_idx" ON "payment_config"("provider");

-- Create index on enabled status for filtering active providers
CREATE INDEX "payment_config_enabled_idx" ON "payment_config"("enabled") WHERE "enabled" = true;

-- Insert default configurations for all providers
INSERT INTO "payment_config" ("id", "provider", "enabled", "priority", "supported_countries", "sandbox_mode")
VALUES
  ('polar_config', 'polar', true, 1, '["US","CA","GB","DE","FR","ES","IT","NL","BE","AT","IE","PT","SE","NO","DK","FI","CH","PL","CZ","GR","HU","RO","BG"]', true),
  ('paymob_config', 'paymob', true, 2, '["SA","AE","KW","QA","BH","OM","EG"]', true),
  ('streampay_config', 'streampay', true, 3, '["SA","AE","KW","QA","BH","OM"]', true);
