/**
 * Retry utility with exponential backoff for handling network errors and Meta API errors
 */

// Network errors that should trigger retry
const RETRYABLE_NETWORK_ERRORS = [
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ENOTFOUND',
  'EPIPE',
  'EAI_AGAIN',
  'SOCKET_TIMEOUT',
  'ECONNABORTED',
  'ENETUNREACH',
  'EHOSTUNREACH',
];

/**
 * Meta API error codes that should trigger retry
 * @see https://developers.facebook.com/docs/graph-api/using-graph-api/error-handling
 */
const RETRYABLE_META_ERRORS = {
  1: 'API Unknown - Retry',
  2: 'API Service - Retry',
  4: 'Too Many Calls - Backoff',
  17: 'User Too Many Calls - Backoff',
  613: 'Rate limit reached - Backoff',
  80000: 'There was a problem processing the request - Retry',
  80001: 'There was a problem processing the request - Retry',
  80002: 'There was a problem processing the request - Retry',
  80003: 'There was a problem processing the request - Retry',
  80004: 'There was a problem processing the request - Retry',
  80005: 'There was a problem processing the request - Retry',
  80006: 'There was a problem processing the request - Retry',
};

/**
 * Meta API error codes that should NOT be retried (permanent errors)
 */
const NON_RETRYABLE_META_ERRORS = {
  190: 'Token Expired - Refresh Required',
  200: 'Permission Denied - Cannot Retry',
  2500: 'Account Disabled - Cannot Retry',
  100: 'Invalid Parameter - Cannot Retry',
  102: 'Session Error - Cannot Retry',
};

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Check if an error is a retryable network error
 */
export function isRetryableNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorCode = (error as NodeJS.ErrnoException).code;
    const errorMessage = error.message;

    // Check if error code matches retryable errors
    if (errorCode && RETRYABLE_NETWORK_ERRORS.includes(errorCode)) {
      return true;
    }

    // Check if error message contains retryable error patterns
    return RETRYABLE_NETWORK_ERRORS.some(code =>
      errorMessage.includes(code)
    ) || errorMessage.includes('socket hang up')
      || errorMessage.includes('network')
      || errorMessage.includes('connection');
  }
  return false;
}

/**
 * Check if a Meta API error is retryable
 */
export function isRetryableMetaError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorMessage = error.message;

    // Try to parse Meta API error code from error message
    const match = errorMessage.match(/code[:\s]+(\d+)/i);
    if (match) {
      const errorCode = parseInt(match[1], 10);

      // Check if it's a retryable Meta error
      if (errorCode in RETRYABLE_META_ERRORS) {
        return true;
      }

      // Check if it's a non-retryable Meta error
      if (errorCode in NON_RETRYABLE_META_ERRORS) {
        return false;
      }
    }

    // Check for rate limit messages
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many calls')) {
      return true;
    }
  }
  return false;
}

/**
 * Check if an error is retryable (network or Meta API)
 */
export function isRetryableError(error: unknown): boolean {
  return isRetryableNetworkError(error) || isRetryableMetaError(error);
}

/**
 * Get user-friendly error message for network errors
 */
export function getNetworkErrorMessage(error: Error): string {
  const errorCode = (error as NodeJS.ErrnoException).code;

  switch (errorCode) {
    case 'ECONNRESET':
      return 'Connection was reset. Please try again.';
    case 'ETIMEDOUT':
      return 'Request timed out. Please check your connection and try again.';
    case 'ECONNREFUSED':
      return 'Could not connect to the server. Please try again later.';
    case 'ENOTFOUND':
      return 'Server not found. Please check your internet connection.';
    case 'EPIPE':
      return 'Connection was closed unexpectedly. Please try again.';
    default:
      if (error.message.includes('ECONNRESET')) {
        return 'Connection was reset. Please try again.';
      }
      return 'A network error occurred. Please try again.';
  }
}

/**
 * Get user-friendly error message for Meta API errors
 */
export function getMetaErrorMessage(error: Error): string {
  const errorMessage = error.message;

  // Try to parse Meta API error code
  const match = errorMessage.match(/code[:\s]+(\d+)/i);
  if (match) {
    const errorCode = parseInt(match[1], 10);

    if (errorCode in RETRYABLE_META_ERRORS) {
      return RETRYABLE_META_ERRORS[errorCode as keyof typeof RETRYABLE_META_ERRORS];
    }

    if (errorCode in NON_RETRYABLE_META_ERRORS) {
      return NON_RETRYABLE_META_ERRORS[errorCode as keyof typeof NON_RETRYABLE_META_ERRORS];
    }
  }

  // Check for rate limit
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many calls')) {
    return 'Rate limit reached. Please wait before trying again.';
  }

  return errorMessage;
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with exponential backoff retry logic
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchData(),
 *   { maxAttempts: 3, baseDelayMs: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = isRetryableError
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt or error is not retryable, throw immediately
      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff: 1s, 2s, 4s...
      // For rate limit errors, use longer delays
      const isRateLimit = lastError.message.includes('rate limit') || lastError.message.includes('too many calls');
      const delayMultiplier = isRateLimit ? 5 : 1;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1) * delayMultiplier, maxDelayMs);

      console.warn(
        `[Retry] Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}. ` +
        `Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

export { RETRYABLE_NETWORK_ERRORS, RETRYABLE_META_ERRORS, NON_RETRYABLE_META_ERRORS };
