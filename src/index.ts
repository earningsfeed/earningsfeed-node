/**
 * Earnings Feed Node.js SDK
 *
 * Official Node.js client for the Earnings Feed API.
 *
 * @example
 * ```typescript
 * import { EarningsFeed } from "earningsfeed";
 *
 * const client = new EarningsFeed("your_api_key");
 *
 * // Get recent filings
 * const filings = await client.filings.list({ ticker: "AAPL", limit: 10 });
 *
 * // Get insider transactions
 * const transactions = await client.insider.list({ direction: "buy" });
 *
 * // Get institutional holdings
 * const holdings = await client.institutional.list({ minValue: 1_000_000_000 });
 *
 * // Get company profile
 * const company = await client.companies.get(320193);
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { EarningsFeed, type EarningsFeedOptions } from "./client.js";

// Error classes
export {
  EarningsFeedError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  ValidationError,
  APIError,
} from "./errors.js";

// Types
export type {
  // Filing types
  Filing,
  FilingCompany,
  FilingDetail,
  FilingDocument,
  FilingRole,
  FilingsResponse,
  ListFilingsParams,
  // Insider types
  InsiderTransaction,
  InsiderTransactionsResponse,
  ListInsiderParams,
  // Institutional types
  InstitutionalHolding,
  InstitutionalHoldingsResponse,
  ListInstitutionalParams,
  // Company types
  Company,
  CompanySearchResult,
  CompanySearchResponse,
  SearchCompaniesParams,
  Ticker,
  SicCode,
  Address,
  // Generic types
  PaginatedResponse,
} from "./types.js";
