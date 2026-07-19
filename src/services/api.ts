export interface APIConfig {
  baseURL: string;
  timeout: number; // in milliseconds
  retries: number;
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isTimeout?: boolean,
    public isNetworkError?: boolean,
  ) {
    super(message);
    this.name = "APIError";
  }
}

const DEFAULT_CONFIG: APIConfig = {
  baseURL: "https://api.mfapi.in/mf",
  timeout: 10000, // 10 seconds
  retries: 2,
};

const BASE_DELAY = 1000; // 1 second
const BACKOFF_MULTIPLIER = 2;

function isRetryableError(error: unknown): boolean {
  // Network errors (TypeError from fetch when offline or DNS failure)
  if (error instanceof TypeError) {
    return true;
  }
  // Timeout errors
  if (error instanceof APIError && error.isTimeout) {
    return true;
  }
  return false;
}

function isRetryableStatus(status: number): boolean {
  return status >= 500;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic, timeout, and error mapping.
 * - Timeout: 10s using AbortController
 * - Retries: max 2 retries with exponential backoff (1s, 2s)
 * - Only retries on network errors and 5xx server errors
 * - 4xx errors are not retried
 */
export async function fetchWithRetry<T>(
  url: string,
  config?: Partial<APIConfig>,
): Promise<T> {
  const { timeout, retries } = { ...DEFAULT_CONFIG, ...config };

  let lastError: APIError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (attempt === 0) {
        console.log("[API] →", url);
      }
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data: T = await response.json();
        console.log("[API] ←", response.status, url);
        console.log(
          "[API] Response:",
          JSON.stringify(data, null, 2).slice(0, 2000),
        );
        return data;
      }

      // Non-retryable 4xx errors
      if (response.status >= 400 && response.status < 500) {
        throw new APIError(
          `Client error: ${response.status} ${response.statusText}`,
          response.status,
          false,
          false,
        );
      }

      // 5xx server errors — retryable
      if (isRetryableStatus(response.status)) {
        lastError = new APIError(
          `Server error: ${response.status} ${response.statusText}`,
          response.status,
          false,
          false,
        );

        if (attempt < retries) {
          const backoffDelay =
            BASE_DELAY * Math.pow(BACKOFF_MULTIPLIER, attempt);
          await delay(backoffDelay);
          continue;
        }

        throw lastError;
      }

      // Other unexpected status codes
      throw new APIError(
        `Unexpected response: ${response.status} ${response.statusText}`,
        response.status,
        false,
        false,
      );
    } catch (error) {
      clearTimeout(timeoutId);

      // Already an APIError (from 4xx or wrapped above) — rethrow non-retryable ones
      if (error instanceof APIError) {
        if (
          !error.isTimeout &&
          !error.isNetworkError &&
          !isRetryableStatus(error.statusCode ?? 0)
        ) {
          throw error;
        }
        lastError = error;
      } else if (error instanceof DOMException && error.name === "AbortError") {
        // Timeout via AbortController
        lastError = new APIError("Request timed out", undefined, true, false);
      } else if (error instanceof TypeError) {
        // Network error (fetch throws TypeError for network failures)
        lastError = new APIError(
          `Network error: ${error.message}`,
          undefined,
          false,
          true,
        );
      } else {
        // Unknown error — wrap and don't retry
        throw new APIError(
          error instanceof Error ? error.message : "An unknown error occurred",
          undefined,
          false,
          false,
        );
      }

      // Retry if we have attempts remaining
      if (attempt < retries && isRetryableError(error)) {
        const backoffDelay = BASE_DELAY * Math.pow(BACKOFF_MULTIPLIER, attempt);
        await delay(backoffDelay);
        continue;
      }

      // Exhausted retries
      if (lastError) {
        console.log("[API] ✗", url, lastError.message);
        throw lastError;
      }
    }
  }

  // This should never be reached, but satisfies TypeScript
  console.log("[API] ✗", url, lastError?.message || "unknown error");
  throw lastError ?? new APIError("Request failed after all retries");
}

export { DEFAULT_CONFIG };
