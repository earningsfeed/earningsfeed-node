/**
 * Institutional holdings resource.
 */

import type { EarningsFeed } from "../client.js";
import type {
  InstitutionalHolding,
  InstitutionalHoldingsResponse,
  ListInstitutionalParams,
} from "../types.js";

/** Parameters for listing institutional holdings (internal use). */
interface ListInstitutionalInternalParams {
  limit?: number;
  cursor?: string;
  companyCik?: number;
  ticker?: string;
  cusip?: string;
  managerCik?: number;
  reportPeriod?: string;
  putCall?: string;
  minValue?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Institutional holdings resource (13F filings).
 */
export class InstitutionalResource {
  private readonly client: EarningsFeed;

  constructor(client: EarningsFeed) {
    this.client = client;
  }

  /**
   * List institutional holdings from 13F filings.
   *
   * @param params - Filter parameters
   * @returns Paginated institutional holdings response
   *
   * @example
   * ```typescript
   * const holdings = await client.institutional.list({
   *   ticker: "AAPL",
   *   minValue: 1_000_000_000, // $1B+ positions
   * });
   * ```
   */
  async list(
    params: ListInstitutionalParams = {}
  ): Promise<InstitutionalHoldingsResponse> {
    const apiParams: ListInstitutionalInternalParams = {
      limit: params.limit ?? 25,
      cursor: params.cursor,
      companyCik: params.cik,
      ticker: params.ticker,
      cusip: params.cusip,
      managerCik: params.managerCik,
      reportPeriod: params.reportPeriod,
      putCall: params.putCall,
      minValue: params.minValue,
    };

    return this.client._request<InstitutionalHoldingsResponse>(
      "/api/v1/institutional/holdings",
      apiParams as Record<string, unknown>
    );
  }

  /**
   * Iterate through all institutional holdings matching the filters.
   *
   * Automatically handles pagination.
   *
   * @param params - Filter parameters
   * @returns AsyncIterator of institutional holdings
   *
   * @example
   * ```typescript
   * // Track Berkshire's holdings
   * for await (const h of client.institutional.iter({ managerCik: 1067983 })) {
   *   console.log(`${h.issuerName}: ${h.shares.toLocaleString()} shares`);
   * }
   * ```
   */
  async *iter(
    params: Omit<ListInstitutionalParams, "cursor"> = {}
  ): AsyncIterableIterator<InstitutionalHolding> {
    let cursor: string | undefined;
    const limit = params.limit ?? 100;

    while (true) {
      const response = await this.list({ ...params, limit, cursor });
      yield* response.items;

      if (!response.hasMore) break;
      cursor = response.nextCursor ?? undefined;
    }
  }
}
