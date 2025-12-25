/**
 * Retry utility with exponential backoff for handling network errors
 */

// Errors that should trigger retry
const RETRYABLE_ERRORS = [
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

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Check if an error is a retryable network error
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorCode = (error as NodeJS.ErrnoException).code;
    const errorMessage = error.message;

    // Check if error code matches retryable errors
    if (errorCode && RETRYABLE_ERRORS.includes(errorCode)) {
      return true;
    }

    // Check if error message contains retryable error patterns
    return RETRYABLE_ERRORS.some(code =>
      errorMessage.includes(code)
    ) || errorMessage.includes('socket hang up')
      || errorMessage.includes('network')
      || errorMessage.includes('connection');
  }
  return false;
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
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);

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

export { RETRYABLE_ERRORS };
