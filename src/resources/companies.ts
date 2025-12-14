/**
 * Companies resource.
 */

import type { EarningsFeed } from "../client.js";
import type {
  Company,
  CompanySearchResult,
  CompanySearchResponse,
  SearchCompaniesParams,
} from "../types.js";

/** Parameters for searching companies (internal use). */
interface SearchCompaniesInternalParams {
  q?: string;
  ticker?: string;
  sicCode?: number;
  state?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Companies resource.
 */
export class CompaniesResource {
  private readonly client: EarningsFeed;

  constructor(client: EarningsFeed) {
    this.client = client;
  }

  /**
   * Get company profile by CIK.
   *
   * @param cik - SEC Central Index Key
   * @returns Company profile with tickers, addresses, and metadata
   *
   * @example
   * ```typescript
   * const apple = await client.companies.get(320193);
   * console.log(`${apple.name} (${apple.primaryTicker})`);
   * ```
   */
  async get(cik: number): Promise<Company> {
    return this.client._request<Company>(`/api/v1/companies/${cik}`);
  }

  /**
   * Search for companies.
   *
   * @param params - Search parameters
   * @returns Paginated company search results
   *
   * @example
   * ```typescript
   * const results = await client.companies.search({
   *   q: "software",
   *   state: "CA",
   *   limit: 10,
   * });
   * ```
   */
  async search(params: SearchCompaniesParams = {}): Promise<CompanySearchResponse> {
    const apiParams: SearchCompaniesInternalParams = {
      q: params.q,
      ticker: params.ticker,
      sicCode: params.sicCode,
      state: params.state,
      limit: params.limit ?? 25,
      cursor: params.cursor,
    };

    return this.client._request<CompanySearchResponse>(
      "/api/v1/companies/search",
      apiParams as Record<string, unknown>
    );
  }

  /**
   * Iterate through all companies matching the search.
   *
   * Automatically handles pagination.
   *
   * @param params - Search parameters
   * @returns AsyncIterator of company search results
   *
   * @example
   * ```typescript
   * for await (const company of client.companies.iterSearch({ state: "NY" })) {
   *   console.log(`${company.name} (${company.ticker})`);
   * }
   * ```
   */
  async *iterSearch(
    params: Omit<SearchCompaniesParams, "cursor"> = {}
  ): AsyncIterableIterator<CompanySearchResult> {
    let cursor: string | undefined;
    const limit = params.limit ?? 100;

    while (true) {
      const response = await this.search({ ...params, limit, cursor });
      yield* response.items;

      if (!response.hasMore) break;
      cursor = response.nextCursor ?? undefined;
    }
  }
}
