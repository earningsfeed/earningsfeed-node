/**
 * Earnings Feed API client.
 */

import {
  APIError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "./errors.js";
import { FilingsResource } from "./resources/filings.js";
import { InsiderResource } from "./resources/insider.js";
import { InstitutionalResource } from "./resources/institutional.js";
import { CompaniesResource } from "./resources/companies.js";

const DEFAULT_BASE_URL = "https://earningsfeed.com";
const DEFAULT_TIMEOUT = 30000;
const VERSION = "0.1.0";

export interface EarningsFeedOptions {
  /** API base URL (default: https://earningsfeed.com) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Client for the Earnings Feed API.
 *
 * @example
 * ```typescript
 * import { EarningsFeed } from "earningsfeed";
 *
 * const client = new EarningsFeed("your_api_key");
 * const filings = await client.filings.list({ ticker: "AAPL", limit: 10 });
 * for (const filing of filings.items) {
 *   console.log(`${filing.formType}: ${filing.title}`);
 * }
 * ```
 */
export class EarningsFeed {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  /** SEC filings resource */
  readonly filings: FilingsResource;
  /** Insider transactions resource */
  readonly insider: InsiderResource;
  /** Institutional holdings resource */
  readonly institutional: InstitutionalResource;
  /** Companies resource */
  readonly companies: CompaniesResource;

  /**
   * Create a new Earnings Feed client.
   *
   * @param apiKey - Your Earnings Feed API key
   * @param options - Client options
   */
  constructor(apiKey: string, options: EarningsFeedOptions = {}) {
    this.apiKey = apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;

    // Initialize resource namespaces
    this.filings = new FilingsResource(this);
    this.insider = new InsiderResource(this);
    this.institutional = new InstitutionalResource(this);
    this.companies = new CompaniesResource(this);
  }

  /**
   * Make an API request.
   * @internal
   */
  async _request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    // Build URL with query params
    const url = new URL(path, this.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "User-Agent": `earningsfeed-node/${VERSION}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle error responses
      if (response.status === 401) {
        throw new AuthenticationError();
      }

      if (response.status === 404) {
        throw new NotFoundError(`Resource not found: ${path}`);
      }

      if (response.status === 429) {
        const resetAt = response.headers.get("X-RateLimit-Reset");
        throw new RateLimitError(
          "Rate limit exceeded",
          resetAt ? parseInt(resetAt, 10) : undefined
        );
      }

      if (response.status === 400) {
        const data = (await response.json()) as { error?: string };
        throw new ValidationError(data.error ?? "Invalid request");
      }

      if (response.status >= 400) {
        try {
          const data = (await response.json()) as { error?: string; code?: string };
          throw new APIError(
            data.error ?? "Unknown error",
            response.status,
            data.code
          );
        } catch (e) {
          if (e instanceof APIError) throw e;
          throw new APIError(`HTTP ${response.status}`, response.status);
        }
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new APIError("Request timeout", 408);
      }

      throw error;
    }
  }
}
