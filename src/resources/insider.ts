/**
 * Insider transactions resource.
 */

import type { EarningsFeed } from "../client.js";
import type {
  InsiderTransaction,
  InsiderTransactionsResponse,
  ListInsiderParams,
} from "../types.js";

/** Parameters for listing insider transactions (internal use). */
interface ListInsiderInternalParams {
  limit?: number;
  cursor?: string;
  cik?: number;
  ticker?: string;
  insiderCik?: number;
  direction?: string;
  codes?: string;
  derivative?: boolean;
  minValue?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Insider transactions resource.
 */
export class InsiderResource {
  private readonly client: EarningsFeed;

  constructor(client: EarningsFeed) {
    this.client = client;
  }

  /**
   * List insider transactions.
   *
   * @param params - Filter parameters
   * @returns Paginated insider transactions response
   *
   * @example
   * ```typescript
   * const transactions = await client.insider.list({
   *   ticker: "AAPL",
   *   direction: "buy",
   *   codes: ["P"],
   *   limit: 50,
   * });
   * ```
   */
  async list(params: ListInsiderParams = {}): Promise<InsiderTransactionsResponse> {
    const apiParams: ListInsiderInternalParams = {
      limit: params.limit ?? 25,
      cursor: params.cursor,
      cik: params.cik,
      ticker: params.ticker,
      insiderCik: params.personCik,
      direction: params.direction,
      codes: Array.isArray(params.codes) ? params.codes.join(",") : params.codes,
      derivative: params.derivative,
      minValue: params.minValue,
      startDate: params.startDate,
      endDate: params.endDate,
    };

    return this.client._request<InsiderTransactionsResponse>(
      "/api/v1/insider/transactions",
      apiParams as Record<string, unknown>
    );
  }

  /**
   * Iterate through all insider transactions matching the filters.
   *
   * Automatically handles pagination.
   *
   * @param params - Filter parameters
   * @returns AsyncIterator of insider transactions
   *
   * @example
   * ```typescript
   * for await (const txn of client.insider.iter({ direction: "sell", minValue: 1_000_000 })) {
   *   console.log(`${txn.companyName}: $${txn.transactionValue}`);
   * }
   * ```
   */
  async *iter(
    params: Omit<ListInsiderParams, "cursor"> = {}
  ): AsyncIterableIterator<InsiderTransaction> {
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
