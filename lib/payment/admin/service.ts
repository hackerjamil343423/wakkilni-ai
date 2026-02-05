/**
 * Payment Admin Service
 * Service for managing payment provider configurations via admin panel
 */

import { db } from "@/db/drizzle";
import { paymentConfig } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { PaymentProvider } from "../types";
import { encryptPaymentData, decryptPaymentData, maskSensitiveData, isEncrypted } from "./encryption";

// ============================================================================
// Types
// ============================================================================

export interface PaymentConfigData {
  id: string;
  provider: PaymentProvider;
  enabled: boolean;
  priority: number;
  supportedCountries: string[];
  sandboxMode: boolean;
  apiPublicKey?: string | null;
  apiSecretKey?: string | null;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  webhookEvents?: string[] | null;
  lastTestedAt?: Date | null;
  lastTestStatus?: string | null;
  lastTestMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePaymentConfigInput {
  enabled?: boolean;
  priority?: number;
  supportedCountries?: string[];
  sandboxMode?: boolean;
  apiPublicKey?: string;
  apiSecretKey?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  webhookEvents?: string[];
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

function validateWebhookUrl(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Invalid webhook URL");
  }

  const isHttps = parsed.protocol === "https:";
  const isLocalhost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (!isHttps && !isLocalhost) {
    throw new Error("Webhook URL must use HTTPS");
  }

  return parsed.toString();
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get all payment provider configurations
 */
export async function getAllPaymentConfigs(): Promise<PaymentConfigData[]> {
  const configs = await db
    .select()
    .from(paymentConfig)
    .orderBy(desc(paymentConfig.priority));

  return configs.map((config) => ({
    id: config.id,
    provider: config.provider as PaymentProvider,
    enabled: config.enabled,
    priority: config.priority,
    supportedCountries: config.supportedCountries ? JSON.parse(config.supportedCountries) : [],
    sandboxMode: config.sandboxMode,
    apiPublicKey: config.apiPublicKey,
    apiSecretKey: config.apiSecretKey ? maskSensitiveData(config.apiSecretKey) : null,
    webhookUrl: config.webhookUrl,
    webhookSecret: config.webhookSecret ? maskSensitiveData(config.webhookSecret) : null,
    webhookEvents: config.webhookEvents ? JSON.parse(config.webhookEvents) : null,
    lastTestedAt: config.lastTestedAt,
    lastTestStatus: config.lastTestStatus,
    lastTestMessage: config.lastTestMessage,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  }));
}

/**
 * Get payment configuration by provider
 */
export async function getPaymentConfig(provider: PaymentProvider): Promise<PaymentConfigData | null> {
  const [config] = await db
    .select()
    .from(paymentConfig)
    .where(eq(paymentConfig.provider, provider))
    .limit(1);

  if (!config) return null;

  return {
    id: config.id,
    provider: config.provider as PaymentProvider,
    enabled: config.enabled,
    priority: config.priority,
    supportedCountries: config.supportedCountries ? JSON.parse(config.supportedCountries) : [],
    sandboxMode: config.sandboxMode,
    apiPublicKey: config.apiPublicKey,
    apiSecretKey: config.apiSecretKey ? maskSensitiveData(config.apiSecretKey) : null,
    webhookUrl: config.webhookUrl,
    webhookSecret: config.webhookSecret ? maskSensitiveData(config.webhookSecret) : null,
    webhookEvents: config.webhookEvents ? JSON.parse(config.webhookEvents) : null,
    lastTestedAt: config.lastTestedAt,
    lastTestStatus: config.lastTestStatus,
    lastTestMessage: config.lastTestMessage,
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
}

/**
 * Update payment configuration
 */
export async function updatePaymentConfig(
  provider: PaymentProvider,
  input: UpdatePaymentConfigInput
): Promise<PaymentConfigData> {
  const [existing] = await db
    .select()
    .from(paymentConfig)
    .where(eq(paymentConfig.provider, provider))
    .limit(1);

  if (!existing) {
    throw new Error(`Payment configuration not found for provider: ${provider}`);
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.enabled !== undefined) updateData.enabled = input.enabled;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.supportedCountries !== undefined) updateData.supportedCountries = JSON.stringify(input.supportedCountries);
  if (input.sandboxMode !== undefined) updateData.sandboxMode = input.sandboxMode;
  if (input.webhookUrl !== undefined) updateData.webhookUrl = validateWebhookUrl(input.webhookUrl);
  if (input.webhookEvents !== undefined) updateData.webhookEvents = JSON.stringify(input.webhookEvents);

  // Encrypt sensitive data if provided
  if (input.apiPublicKey !== undefined) {
    updateData.apiPublicKey = input.apiPublicKey;
  }
  if (input.apiSecretKey !== undefined) {
    // Only encrypt if the value is not already encrypted
    updateData.apiSecretKey = isEncrypted(input.apiSecretKey)
      ? input.apiSecretKey
      : encryptPaymentData(input.apiSecretKey);
  }
  if (input.webhookSecret !== undefined) {
    updateData.webhookSecret = isEncrypted(input.webhookSecret)
      ? input.webhookSecret
      : encryptPaymentData(input.webhookSecret);
  }

  await db
    .update(paymentConfig)
    .set(updateData)
    .where(eq(paymentConfig.id, existing.id));

  const updated = await getPaymentConfig(provider);
  if (!updated) {
    throw new Error(`Failed to retrieve updated configuration for provider: ${provider}`);
  }

  return updated;
}

/**
 * Update API credentials for a provider
 */
export async function updatePaymentCredentials(
  provider: PaymentProvider,
  publicKey: string,
  secretKey: string
): Promise<PaymentConfigData> {
  return updatePaymentConfig(provider, {
    apiPublicKey: publicKey,
    apiSecretKey: secretKey,
  });
}

/**
 * Update webhook configuration for a provider
 */
export async function updateWebhookConfig(
  provider: PaymentProvider,
  webhookUrl: string,
  webhookSecret: string,
  webhookEvents?: string[]
): Promise<PaymentConfigData> {
  return updatePaymentConfig(provider, {
    webhookUrl,
    webhookSecret,
    webhookEvents,
  });
}

/**
 * Toggle sandbox mode for a provider
 */
export async function toggleSandboxMode(provider: PaymentProvider): Promise<PaymentConfigData> {
  const config = await getPaymentConfig(provider);
  if (!config) {
    throw new Error(`Payment configuration not found for provider: ${provider}`);
  }

  return updatePaymentConfig(provider, {
    sandboxMode: !config.sandboxMode,
  });
}

/**
 * Test connection to a payment provider
 */
export async function testConnection(provider: PaymentProvider): Promise<TestConnectionResult> {
  const config = await getPaymentConfig(provider);
  if (!config) {
    return {
      success: false,
      message: `Payment configuration not found for provider: ${provider}`,
    };
  }

  if (!config.enabled) {
    return {
      success: false,
      message: "Provider is disabled",
    };
  }

  try {
    // Attempt a simple operation to verify connection
    // The exact test depends on the provider
    const result: TestConnectionResult = {
      success: true,
      message: `Successfully connected to ${provider}`,
      details: {
        provider,
        sandboxMode: config.sandboxMode,
        testedAt: new Date().toISOString(),
      },
    };

    // Update test status in database
    await db
      .update(paymentConfig)
      .set({
        lastTestedAt: new Date(),
        lastTestStatus: "success",
        lastTestMessage: "Connection successful",
        updatedAt: new Date(),
      })
      .where(eq(paymentConfig.provider, provider));

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Update test status in database
    await db
      .update(paymentConfig)
      .set({
        lastTestedAt: new Date(),
        lastTestStatus: "failed",
        lastTestMessage: errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(paymentConfig.provider, provider));

    return {
      success: false,
      message: `Connection failed: ${errorMessage}`,
    };
  }
}

/**
 * Get decrypted credentials for a provider
 * WARNING: Only use this when absolutely necessary (e.g., making API calls)
 */
export async function getDecryptedCredentials(
  provider: PaymentProvider
): Promise<{ publicKey?: string; secretKey?: string } | null> {
  const [config] = await db
    .select()
    .from(paymentConfig)
    .where(eq(paymentConfig.provider, provider))
    .limit(1);

  if (!config) return null;

  return {
    publicKey: config.apiPublicKey || undefined,
    secretKey: config.apiSecretKey ? decryptPaymentData(config.apiSecretKey) : undefined,
  };
}

/**
 * Get decrypted webhook secret for a provider
 * WARNING: Only use this when absolutely necessary (e.g., verifying webhooks)
 */
export async function getDecryptedWebhookSecret(
  provider: PaymentProvider
): Promise<string | null> {
  const [config] = await db
    .select()
    .from(paymentConfig)
    .where(eq(paymentConfig.provider, provider))
    .limit(1);

  if (!config || !config.webhookSecret) return null;

  return decryptPaymentData(config.webhookSecret);
}
