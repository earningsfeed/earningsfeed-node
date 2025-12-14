# Earnings Feed Node.js SDK

[![npm](https://img.shields.io/npm/v/earningsfeed)](https://www.npmjs.com/package/earningsfeed)

Official Node.js client for the [Earnings Feed API](https://earningsfeed.com/api) — SEC filings, insider transactions, and institutional holdings.

## Installation

```bash
npm install earningsfeed
```

## Quick Start

```typescript
import { EarningsFeed } from "earningsfeed";

const client = new EarningsFeed("your_api_key");

// Get recent 10-K and 10-Q filings
const filings = await client.filings.list({ forms: ["10-K", "10-Q"], limit: 10 });
for (const filing of filings.items) {
  console.log(`${filing.formType}: ${filing.companyName} - ${filing.title}`);
}

// Get a company profile
const apple = await client.companies.get(320193);
console.log(`${apple.name} (${apple.primaryTicker})`);
```

## Features

- **TypeScript** — Full type definitions included
- **Async iterators** — Auto-pagination with `for await...of`
- **Zero dependencies** — Uses native `fetch` (Node 18+)
- **ESM + CommonJS** — Works with any module system

## Usage

### SEC Filings

```typescript
// List filings with filters
const filings = await client.filings.list({
  ticker: "AAPL",
  forms: ["10-K", "10-Q", "8-K"],
  status: "final",
  limit: 25,
});

// Iterate through all filings (auto-pagination)
for await (const filing of client.filings.iter({ ticker: "AAPL", forms: "8-K" })) {
  console.log(filing.title);
}

// Get filing details with documents
const detail = await client.filings.get("0000320193-24-000123");
for (const doc of detail.documents) {
  console.log(`${doc.docType}: ${doc.filename}`);
}
```

### Insider Transactions

```typescript
// Recent insider purchases
const purchases = await client.insider.list({
  ticker: "AAPL",
  direction: "buy",
  codes: ["P"], // Open market purchases
  limit: 50,
});

for (const txn of purchases.items) {
  console.log(`${txn.personName}: ${txn.shares} shares @ $${txn.pricePerShare}`);
}

// Large sales across all companies
for await (const txn of client.insider.iter({ direction: "sell", minValue: 1_000_000 })) {
  console.log(`${txn.companyName}: $${txn.transactionValue?.toLocaleString()}`);
}
```

### Institutional Holdings (13F)

```typescript
// Who owns Apple?
const holdings = await client.institutional.list({
  ticker: "AAPL",
  minValue: 1_000_000_000, // $1B+ positions
});

for (const h of holdings.items) {
  console.log(`${h.managerName}: ${h.shares.toLocaleString()} shares ($${h.value.toLocaleString()})`);
}

// Track a specific fund
for await (const h of client.institutional.iter({ managerCik: 1067983 })) { // Berkshire
  console.log(`${h.issuerName}: ${h.shares.toLocaleString()} shares`);
}
```

### Companies

```typescript
// Get company profile
const company = await client.companies.get(320193);
console.log(company.name);
console.log(`Ticker: ${company.primaryTicker}`);
console.log(`Industry: ${company.sicCodes[0]?.description}`);

// Search companies
const results = await client.companies.search({ q: "software", state: "CA", limit: 10 });
for (const company of results.items) {
  console.log(`${company.name} (${company.ticker})`);
}
```

## Error Handling

```typescript
import {
  EarningsFeed,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
} from "earningsfeed";

const client = new EarningsFeed("your_api_key");

try {
  const filing = await client.filings.get("invalid-accession");
} catch (e) {
  if (e instanceof NotFoundError) {
    console.log("Filing not found");
  } else if (e instanceof RateLimitError) {
    console.log(`Rate limited. Resets at: ${e.resetAt}`);
  } else if (e instanceof AuthenticationError) {
    console.log("Invalid API key");
  }
}
```

## API Reference

Full API documentation: [earningsfeed.com/api/docs](https://earningsfeed.com/api/docs)

## License

MIT
