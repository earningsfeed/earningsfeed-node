/**
 * SEC filings resource.
 */

import type { EarningsFeed } from "../client.js";
import type {
  Filing,
  FilingDetail,
  FilingsResponse,
  ListFilingsParams,
} from "../types.js";

/** Parameters for listing filings (internal use). */
interface ListFilingsInternalParams {
  limit?: number;
  cursor?: string;
  forms?: string;
  cik?: number;
  ticker?: string;
  status?: string;
  issuerType?: string;
  startDate?: string;
  endDate?: string;
  q?: string;
}

/**
 * SEC filings resource.
 */
export class FilingsResource {
  private readonly client: EarningsFeed;

  constructor(client: EarningsFeed) {
    this.client = client;
  }

  /**
   * List SEC filings.
   *
   * @param params - Filter parameters
   * @returns Paginated filings response
   *
   * @example
   * ```typescript
   * const filings = await client.filings.list({
   *   ticker: "AAPL",
   *   forms: ["10-K", "10-Q"],
   *   limit: 10,
   * });
   * ```
   */
  async list(params: ListFilingsParams = {}): Promise<FilingsResponse> {
    const apiParams: ListFilingsInternalParams = {
      limit: params.limit ?? 25,
      cursor: params.cursor,
      forms: Array.isArray(params.forms) ? params.forms.join(",") : params.forms,
      cik: params.cik,
      ticker: params.ticker,
      status: params.status ?? "all",
      startDate: params.startDate,
      endDate: params.endDate,
      q: params.q,
    };

    return this.client._request<FilingsResponse>(
      "/api/v1/filings",
      apiParams as Record<string, unknown>
    );
  }

  /**
   * Iterate through all filings matching the filters.
   *
   * Automatically handles pagination.
   *
   * @param params - Filter parameters
   * @returns AsyncIterator of filings
   *
   * @example
   * ```typescript
   * for await (const filing of client.filings.iter({ ticker: "AAPL" })) {
   *   console.log(filing.title);
   * }
   * ```
   */
  async *iter(
    params: Omit<ListFilingsParams, "cursor"> = {}
  ): AsyncIterableIterator<Filing> {
    let cursor: string | undefined;
    const limit = params.limit ?? 100;

    while (true) {
      const response = await this.list({ ...params, limit, cursor });
      yield* response.items;

      if (!response.hasMore) break;
      cursor = response.nextCursor ?? undefined;
    }
  }

  /**
   * Get detailed information about a specific filing.
   *
   * @param accession - SEC accession number (with or without dashes)
   * @returns Filing detail with documents and roles
   *
   * @example
   * ```typescript
   * const detail = await client.filings.get("0000320193-24-000123");
   * for (const doc of detail.documents) {
   *   console.log(`${doc.docType}: ${doc.filename}`);
   * }
   * ```
   */
  async get(accession: string): Promise<FilingDetail> {
    return this.client._request<FilingDetail>(`/api/v1/filings/${accession}`);
  }
}
