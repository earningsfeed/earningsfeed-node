/**
 * TypeScript types for Earnings Feed API responses.
 */

// ============================================================================
// Filing Types
// ============================================================================

/** Company details attached to a filing. */
export interface FilingCompany {
  /** SEC Central Index Key */
  cik: number;
  /** Company name */
  name: string;
  /** State/country code */
  stateOfIncorporation?: string | null;
  /** Full state/country name */
  stateOfIncorporationDescription?: string | null;
  /** Fiscal year end (MMDD) */
  fiscalYearEnd?: string | null;
}

/** SEC filing from the filings feed. */
export interface Filing {
  /** SEC accession number */
  accessionNumber: string;
  /** Accession number without dashes */
  accessionNoDashes?: string | null;
  /** Filer CIK */
  cik: number;
  /** Company name */
  companyName?: string | null;
  /** SEC form type (10-K, 8-K, etc.) */
  formType: string;
  /** Filing submission time */
  filedAt: string;
  /** SEC acceptance time */
  acceptTs?: string | null;
  /** Whether filing is provisional */
  provisional: boolean;
  /** Feed day (YYYY-MM-DD) */
  feedDay?: string | null;
  /** Primary document size in bytes */
  sizeBytes: number;
  /** SEC EDGAR URL */
  url: string;
  /** Filing title */
  title: string;
  /** Filing status */
  status: string;
  /** Last updated timestamp */
  updatedAt: string;
  /** Primary stock ticker */
  primaryTicker?: string | null;
  /** Primary exchange */
  primaryExchange?: string | null;
  /** Company details */
  company?: FilingCompany | null;
  /** Sort timestamp */
  sortedAt: string;
  /** Company logo URL */
  logoUrl?: string | null;
  /** Entity class */
  entityClass?: "company" | "person" | null;
}

/** Document within a filing. */
export interface FilingDocument {
  /** Document sequence number */
  seq: number;
  /** Filename on SEC EDGAR */
  filename: string;
  /** Document type */
  docType: string;
  /** Document description */
  description?: string | null;
  /** Whether primary document */
  isPrimary: boolean;
}

/** Entity role in a filing. */
export interface FilingRole {
  /** Entity CIK */
  cik: number;
  /** Role type (filer, issuer, reporting-owner, etc.) */
  role: string;
}

/** Detailed filing information. */
export interface FilingDetail {
  /** SEC accession number */
  accessionNumber: string;
  /** Accession number without dashes */
  accessionNoDashes?: string | null;
  /** Filer CIK */
  cik: number;
  /** SEC form type */
  formType: string;
  /** Filing submission time */
  filedAt: string;
  /** SEC acceptance time */
  acceptTs?: string | null;
  /** Whether filing is provisional */
  provisional: boolean;
  /** Feed day (YYYY-MM-DD) */
  feedDay?: string | null;
  /** Filing title */
  title: string;
  /** SEC EDGAR URL */
  url: string;
  /** Primary document size in bytes */
  sizeBytes: number;
  /** SEC relative directory */
  secRelativeDir?: string | null;
  /** Company name */
  companyName?: string | null;
  /** Primary stock ticker */
  primaryTicker?: string | null;
  /** Company details */
  company?: FilingCompany | null;
  /** Filing documents */
  documents: FilingDocument[];
  /** Entity roles */
  roles: FilingRole[];
}

// ============================================================================
// Insider Transaction Types
// ============================================================================

/** Insider transaction from Form 3/4/5. */
export interface InsiderTransaction {
  /** SEC accession number */
  accessionNumber: string;
  /** Filing submission time */
  filedAt: string;
  /** Form type (3, 4, or 5) */
  formType: string;
  /** Insider's CIK */
  personCik: number;
  /** Insider's name */
  personName: string;
  /** Company CIK */
  companyCik: number;
  /** Company name */
  companyName?: string | null;
  /** Stock ticker */
  ticker?: string | null;
  /** Whether insider is a director */
  isDirector: boolean;
  /** Whether insider is an officer */
  isOfficer: boolean;
  /** Whether insider is a 10% owner */
  isTenPercentOwner: boolean;
  /** Whether insider has other relationship */
  isOther: boolean;
  /** Officer title */
  officerTitle?: string | null;
  /** Security title */
  securityTitle: string;
  /** Whether this is a derivative transaction */
  isDerivative: boolean;
  /** Transaction date (YYYY-MM-DD) */
  transactionDate: string;
  /** Transaction code (P, S, A, M, G, etc.) */
  transactionCode: string;
  /** Whether equity swap was involved */
  equitySwapInvolved: boolean;
  /** Number of shares */
  shares?: number | null;
  /** Price per share */
  pricePerShare?: number | null;
  /** Acquired (A) or Disposed (D) */
  acquiredDisposed: "A" | "D";
  /** Shares owned after transaction */
  sharesAfter?: number | null;
  /** Direct (D) or Indirect (I) ownership */
  directIndirect: "D" | "I";
  /** Nature of indirect ownership */
  ownershipNature?: string | null;
  /** Derivative conversion/exercise price */
  conversionOrExercisePrice?: number | null;
  /** Derivative exercise date */
  exerciseDate?: string | null;
  /** Derivative expiration date */
  expirationDate?: string | null;
  /** Underlying security title */
  underlyingSecurityTitle?: string | null;
  /** Underlying shares */
  underlyingShares?: number | null;
  /** Total transaction value */
  transactionValue?: number | null;
}

// ============================================================================
// Institutional Holdings Types
// ============================================================================

/** Institutional holding from 13F filing. */
export interface InstitutionalHolding {
  /** 9-character CUSIP */
  cusip: string;
  /** Issuer name */
  issuerName: string;
  /** Share class title */
  classTitle: string;
  /** Company CIK */
  companyCik?: number | null;
  /** Stock ticker */
  ticker?: string | null;
  /** Market value in USD */
  value: number;
  /** Number of shares */
  shares: number;
  /** Shares type: SH (shares) or PRN (principal amount) */
  sharesType: "SH" | "PRN";
  /** Put or Call option */
  putCall?: "Put" | "Call" | null;
  /** Investment discretion type */
  investmentDiscretion: "SOLE" | "DFND" | "OTHER";
  /** Other manager identifier */
  otherManager?: string | null;
  /** Sole voting authority shares */
  votingSole?: number | null;
  /** Shared voting authority shares */
  votingShared?: number | null;
  /** No voting authority shares */
  votingNone?: number | null;
  /** Manager CIK */
  managerCik: number;
  /** Manager name */
  managerName: string;
  /** Quarter end date (YYYY-MM-DD) */
  reportPeriodDate: string;
  /** Filing submission time */
  filedAt: string;
  /** SEC accession number */
  accessionNumber: string;
}

// ============================================================================
// Company Types
// ============================================================================

/** Stock ticker information. */
export interface Ticker {
  /** Ticker symbol */
  symbol: string;
  /** Exchange name */
  exchange: string;
  /** Whether this is the primary ticker */
  isPrimary: boolean;
}

/** Standard Industrial Classification code. */
export interface SicCode {
  /** SIC code number */
  code: number;
  /** SIC description */
  description: string;
}

/** Company address. */
export interface Address {
  /** Address type (mailing, business) */
  type: string;
  /** Street line 1 */
  street1?: string | null;
  /** Street line 2 */
  street2?: string | null;
  /** City */
  city?: string | null;
  /** State or country code */
  stateOrCountry?: string | null;
  /** State or country name */
  stateOrCountryDescription?: string | null;
  /** ZIP/postal code */
  zipCode?: string | null;
}

/** Company profile. */
export interface Company {
  /** SEC Central Index Key */
  cik: number;
  /** Company name */
  name: string;
  /** Entity type */
  entityType?: string | null;
  /** Category */
  category?: string | null;
  /** Company description */
  description?: string | null;
  /** Stock tickers */
  tickers: Ticker[];
  /** Primary ticker symbol */
  primaryTicker?: string | null;
  /** SIC codes */
  sicCodes: SicCode[];
  /** Employer Identification Number */
  ein?: string | null;
  /** Fiscal year end (MMDD) */
  fiscalYearEnd?: string | null;
  /** State of incorporation code */
  stateOfIncorporation?: string | null;
  /** State of incorporation name */
  stateOfIncorporationDescription?: string | null;
  /** Phone number */
  phone?: string | null;
  /** Company website */
  website?: string | null;
  /** Investor relations website */
  investorWebsite?: string | null;
  /** Company addresses */
  addresses: Address[];
  /** Company logo URL */
  logoUrl?: string | null;
  /** Whether company has insider transactions */
  hasInsiderTransactions: boolean;
  /** Whether entity is an insider */
  isInsider: boolean;
  /** Last updated timestamp */
  updatedAt: string;
}

/** Company search result. */
export interface CompanySearchResult {
  /** SEC Central Index Key */
  cik: number;
  /** Company name */
  name: string;
  /** Primary ticker symbol */
  ticker?: string | null;
  /** Primary exchange */
  exchange?: string | null;
  /** Entity type */
  entityType?: string | null;
  /** Category */
  category?: string | null;
  /** SIC code */
  sicCode?: number | null;
  /** SIC description */
  sicDescription?: string | null;
  /** Company logo URL */
  logoUrl?: string | null;
}

// ============================================================================
// Response Types
// ============================================================================

/** Base for paginated responses. */
export interface PaginatedResponse<T> {
  /** Items in this page */
  items: T[];
  /** Cursor for next page */
  nextCursor?: string | null;
  /** Whether more results exist */
  hasMore: boolean;
}

/** Response from /filings endpoint. */
export type FilingsResponse = PaginatedResponse<Filing>;

/** Response from /filings/:accession endpoint. */
export type FilingDetailResponse = FilingDetail;

/** Response from /insider/transactions endpoint. */
export type InsiderTransactionsResponse = PaginatedResponse<InsiderTransaction>;

/** Response from /institutional/holdings endpoint. */
export type InstitutionalHoldingsResponse = PaginatedResponse<InstitutionalHolding>;

/** Response from /companies/:cik endpoint. */
export type CompanyResponse = Company;

/** Response from /companies/search endpoint. */
export type CompanySearchResponse = PaginatedResponse<CompanySearchResult>;

// ============================================================================
// Request Parameter Types
// ============================================================================

/** Parameters for listing filings. */
export interface ListFilingsParams {
  /** Filter by form types */
  forms?: string | string[];
  /** Filter by ticker symbol */
  ticker?: string;
  /** Filter by CIK */
  cik?: number;
  /** Filter by filing status */
  status?: "all" | "provisional" | "final";
  /** Start date (YYYY-MM-DD) */
  startDate?: string;
  /** End date (YYYY-MM-DD) */
  endDate?: string;
  /** Search query */
  q?: string;
  /** Results per page (1-100) */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
}

/** Parameters for listing insider transactions. */
export interface ListInsiderParams {
  /** Filter by ticker symbol */
  ticker?: string;
  /** Filter by company CIK */
  cik?: number;
  /** Filter by person CIK */
  personCik?: number;
  /** Filter by direction */
  direction?: "buy" | "sell";
  /** Filter by transaction codes */
  codes?: string | string[];
  /** Filter derivatives only */
  derivative?: boolean;
  /** Minimum transaction value */
  minValue?: number;
  /** Start date (YYYY-MM-DD) */
  startDate?: string;
  /** End date (YYYY-MM-DD) */
  endDate?: string;
  /** Results per page (1-100) */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
}

/** Parameters for listing institutional holdings. */
export interface ListInstitutionalParams {
  /** Filter by company CIK */
  cik?: number;
  /** Filter by ticker symbol */
  ticker?: string;
  /** Filter by CUSIP */
  cusip?: string;
  /** Filter by manager CIK */
  managerCik?: number;
  /** Filter by minimum value */
  minValue?: number;
  /** Filter by put/call/equity */
  putCall?: "put" | "call" | "equity";
  /** Filter by report period (YYYY-MM-DD) */
  reportPeriod?: string;
  /** Results per page (1-100) */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
}

/** Parameters for searching companies. */
export interface SearchCompaniesParams {
  /** Search query */
  q?: string;
  /** Filter by ticker */
  ticker?: string;
  /** Filter by SIC code */
  sicCode?: number;
  /** Filter by state */
  state?: string;
  /** Results per page (1-100) */
  limit?: number;
  /** Pagination cursor */
  cursor?: string;
}
