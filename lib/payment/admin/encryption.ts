/**
 * Payment Admin Encryption Utilities
 * Secure encryption/decryption for storing sensitive payment credentials
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get the encryption key from environment
 * Falls back to a default key for development (NOT SECURE FOR PRODUCTION)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.PAYMENT_ADMIN_ENCRYPTION_KEY;
  const salt = process.env.PAYMENT_ADMIN_ENCRYPTION_SALT;

  if (!key || !salt) {
    throw new Error(
      "Missing payment encryption configuration. Set PAYMENT_ADMIN_ENCRYPTION_KEY and PAYMENT_ADMIN_ENCRYPTION_SALT.",
    );
  }

  if (key.length < 32) {
    throw new Error("PAYMENT_ADMIN_ENCRYPTION_KEY must be at least 32 characters long.");
  }

  // Use scrypt to derive a 32-byte key from the input
  // Salt should be unique per application deployment
  return scryptSync(key, salt, 32);
}

/**
 * Get the algorithm used for encryption
 */
const ALGORITHM = "aes-256-gcm";

/**
 * Get the IV length for the algorithm
 */
const IV_LENGTH = 16;

/**
 * Get the auth tag length for GCM mode
 */
const AUTH_TAG_LENGTH = 16;

// ============================================================================
// Encryption Functions
// ============================================================================

/**
 * Encrypt sensitive data (API keys, secrets)
 * @param data - The plaintext data to encrypt
 * @returns Encrypted data with IV and auth tag (format: iv:authTag:encrypted)
 */
export function encryptPaymentData(data: string): string {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get auth tag for GCM mode
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encrypted (all hex encoded)
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (error) {
    throw new Error(`Failed to encrypt payment data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Decrypt sensitive data (API keys, secrets)
 * @param encryptedData - The encrypted data (format: iv:authTag:encrypted)
 * @returns The decrypted plaintext data
 */
export function decryptPaymentData(encryptedData: string): string {
  try {
    const key = getEncryptionKey();

    // Split the encrypted data into parts
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const [ivHex, authTagHex, encrypted] = parts;

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(`Failed to decrypt payment data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Mask sensitive data for display
 * Shows first 4 and last 4 characters with asterisks in between
 * @param data - The data to mask
 * @returns Masked data (e.g., "pk_****_xyz123")
 */
export function maskSensitiveData(data: string): string {
  if (!data || data.length < 8) {
    return "****";
  }

  const start = data.slice(0, 4);
  const end = data.slice(-4);
  const middle = "*".repeat(Math.min(data.length - 8, 8));

  return `${start}${middle}${end}`;
}

/**
 * Check if data appears to be encrypted
 * @param data - The data to check
 * @returns True if data appears to be in encrypted format
 */
export function isEncrypted(data: string | null | undefined): boolean {
  if (!data) return false;
  // Check for iv:authTag:encrypted format
  const parts = data.split(":");
  return parts.length === 3 && parts[0].length === IV_LENGTH * 2 && parts[1].length === AUTH_TAG_LENGTH * 2;
}
