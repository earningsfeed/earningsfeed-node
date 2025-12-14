import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  EarningsFeed,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  ValidationError,
  APIError,
} from "../src/index.js";

const BASE_URL = "https://api.test.com";

// Mock server setup
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createClient() {
  return new EarningsFeed("test_api_key", { baseUrl: BASE_URL });
}

describe("Client Initialization", () => {
  it("should set authorization header", async () => {
    let capturedHeaders: Headers | null = null;

    server.use(
      http.get(`${BASE_URL}/api/v1/filings`, ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ items: [], hasMore: false });
      })
    );

    const client = createClient();
    await client.filings.list();

    expect(capturedHeaders?.get("Authorization")).toBe("Bearer test_api_key");
  });

  it("should set user-agent header", async () => {
    let capturedHeaders: Headers | null = null;

    server.use(
      http.get(`${BASE_URL}/api/v1/filings`, ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ items: [], hasMore: false });
      })
    );

    const client = createClient();
    await client.filings.list();

    expect(capturedHeaders?.get("User-Agent")).toMatch(/^earningsfeed-node\//);
  });
});

describe("Error Handling", () => {
  it("should throw AuthenticationError on 401", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/filings`, () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    const client = createClient();
    await expect(client.filings.list()).rejects.toThrow(AuthenticationError);
  });

  it("should throw NotFoundError on 404", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/filings/invalid`, () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const client = createClient();
    await expect(client.filings.get("invalid")).rejects.toThrow(NotFoundError);
  });

  it("should throw RateLimitError on 429 with reset time", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/filings`, () => {
        return new HttpResponse(null, {
          status: 429,
          headers: { "X-RateLimit-Reset": "1700000000" },
        });
      })
    );

    const client = createClient();
    try {
      await client.filings.list();
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(RateLimitError);
      expect((e as RateLimitError).resetAt).toBe(1700000000);
    }
  });

  it("should throw ValidationError on 400", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/filings`, () => {
        return HttpResponse.json({ error: "Invalid parameter" }, { status: 400 });
      })
    );

    const client = createClient();
    await expect(client.filings.list()).rejects.toThrow(ValidationError);
  });

  it("should throw APIError on 500", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/filings`, () => {
        return HttpResponse.json(
          { error: "Internal error", code: "INTERNAL" },
          { status: 500 }
        );
      })
    );

    const client = createClient();
    try {
      await client.filings.list();
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(APIError);
      expect((e as APIError).statusCode).toBe(500);
      expect((e as APIError).code).toBe("INTERNAL");
    }
  });
});

describe("FilingsResource", () => {
  it("should list filings with pagination", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/filings`, () => {
        return HttpResponse.json({
          items: [
            {
              accessionNumber: "0000320193-24-000123",
              cik: 320193,
              companyName: "Apple Inc.",
              formType: "10-K",
              filedAt: "2024-01-01T00:00:00Z",
              provisional: false,
              sizeBytes: 12345,
              url: "https://sec.gov/...",
              title: "Annual Report",
              status: "final",
              updatedAt: "2024-01-01T00:00:00Z",
              sortedAt: "2024-01-01T00:00:00Z",
            },
          ],
          nextCursor: "abc123",
          hasMore: true,
        });
      })
    );

    const client = createClient();
    const response = await client.filings.list({ ticker: "AAPL", limit: 10 });

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.accessionNumber).toBe("0000320193-24-000123");
    expect(response.items[0]?.formType).toBe("10-K");
    expect(response.nextCursor).toBe("abc123");
    expect(response.hasMore).toBe(true);
  });

  it("should convert form list to comma-separated string", async () => {
    let capturedUrl: URL | null = null;

    server.use(
      http.get(`${BASE_URL}/api/v1/filings`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({ items: [], hasMore: false });
      })
    );

    const client = createClient();
    await client.filings.list({ forms: ["10-K", "10-Q", "8-K"] });

    expect(capturedUrl?.searchParams.get("forms")).toBe("10-K,10-Q,8-K");
  });

  it("should get filing detail with documents", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/filings/0000320193-24-000126`, () => {
        return HttpResponse.json({
          accessionNumber: "0000320193-24-000126",
          cik: 320193,
          formType: "10-K",
          filedAt: "2024-01-01T00:00:00Z",
          provisional: false,
          title: "Annual Report",
          url: "https://sec.gov/...",
          sizeBytes: 12345,
          documents: [
            {
              seq: 1,
              filename: "aapl-20231230.htm",
              docType: "10-K",
              isPrimary: true,
            },
          ],
          roles: [{ cik: 320193, role: "filer" }],
        });
      })
    );

    const client = createClient();
    const detail = await client.filings.get("0000320193-24-000126");

    expect(detail.accessionNumber).toBe("0000320193-24-000126");
    expect(detail.documents).toHaveLength(1);
    expect(detail.documents[0]?.filename).toBe("aapl-20231230.htm");
    expect(detail.roles).toHaveLength(1);
  });

  it("should iterate through paginated filings", async () => {
    let callCount = 0;

    server.use(
      http.get(`${BASE_URL}/api/v1/filings`, ({ request }) => {
        callCount++;
        const url = new URL(request.url);
        const cursor = url.searchParams.get("cursor");

        if (!cursor) {
          return HttpResponse.json({
            items: [{ accessionNumber: "filing-1", cik: 1, formType: "10-K", filedAt: "2024-01-01T00:00:00Z", provisional: false, sizeBytes: 100, url: "https://example.com", title: "Filing 1", status: "final", updatedAt: "2024-01-01T00:00:00Z", sortedAt: "2024-01-01T00:00:00Z" }],
            nextCursor: "page2",
            hasMore: true,
          });
        }
        return HttpResponse.json({
          items: [{ accessionNumber: "filing-2", cik: 1, formType: "10-Q", filedAt: "2024-01-02T00:00:00Z", provisional: false, sizeBytes: 100, url: "https://example.com", title: "Filing 2", status: "final", updatedAt: "2024-01-02T00:00:00Z", sortedAt: "2024-01-02T00:00:00Z" }],
          hasMore: false,
        });
      })
    );

    const client = createClient();
    const filings: string[] = [];

    for await (const filing of client.filings.iter({ limit: 1 })) {
      filings.push(filing.accessionNumber);
    }

    expect(filings).toEqual(["filing-1", "filing-2"]);
    expect(callCount).toBe(2);
  });
});

describe("InsiderResource", () => {
  it("should list insider transactions", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/insider/transactions`, () => {
        return HttpResponse.json({
          items: [
            {
              accessionNumber: "0000001-24-000001",
              filedAt: "2024-01-01T00:00:00Z",
              formType: "4",
              personCik: 12345,
              personName: "John Doe",
              companyCik: 320193,
              companyName: "Apple Inc.",
              ticker: "AAPL",
              isDirector: true,
              isOfficer: false,
              isTenPercentOwner: false,
              isOther: false,
              securityTitle: "Common Stock",
              isDerivative: false,
              transactionDate: "2024-01-01",
              transactionCode: "P",
              equitySwapInvolved: false,
              shares: 1000,
              pricePerShare: 150.0,
              acquiredDisposed: "A",
              sharesAfter: 5000,
              directIndirect: "D",
              transactionValue: 150000,
            },
          ],
          hasMore: false,
        });
      })
    );

    const client = createClient();
    const response = await client.insider.list({ ticker: "AAPL", direction: "buy" });

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.personName).toBe("John Doe");
    expect(response.items[0]?.transactionCode).toBe("P");
    expect(response.items[0]?.shares).toBe(1000);
  });
});

describe("InstitutionalResource", () => {
  it("should list institutional holdings", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/institutional/holdings`, () => {
        return HttpResponse.json({
          items: [
            {
              cusip: "037833100",
              issuerName: "Apple Inc.",
              classTitle: "COM",
              companyCik: 320193,
              ticker: "AAPL",
              value: 5000000000,
              shares: 25000000,
              sharesType: "SH",
              investmentDiscretion: "SOLE",
              managerCik: 1067983,
              managerName: "Berkshire Hathaway Inc",
              reportPeriodDate: "2024-03-31",
              filedAt: "2024-05-15T00:00:00Z",
              accessionNumber: "0001067983-24-000001",
            },
          ],
          hasMore: false,
        });
      })
    );

    const client = createClient();
    const response = await client.institutional.list({ ticker: "AAPL" });

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.managerName).toBe("Berkshire Hathaway Inc");
    expect(response.items[0]?.value).toBe(5000000000);
  });
});

describe("CompaniesResource", () => {
  it("should get company by CIK", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/companies/320193`, () => {
        return HttpResponse.json({
          cik: 320193,
          name: "Apple Inc.",
          entityType: "operating",
          tickers: [{ symbol: "AAPL", exchange: "NASDAQ", isPrimary: true }],
          primaryTicker: "AAPL",
          sicCodes: [{ code: 3571, description: "Electronic Computers" }],
          addresses: [],
          hasInsiderTransactions: true,
          isInsider: false,
          updatedAt: "2024-01-01T00:00:00Z",
        });
      })
    );

    const client = createClient();
    const company = await client.companies.get(320193);

    expect(company.cik).toBe(320193);
    expect(company.name).toBe("Apple Inc.");
    expect(company.primaryTicker).toBe("AAPL");
    expect(company.tickers).toHaveLength(1);
    expect(company.sicCodes).toHaveLength(1);
  });

  it("should search companies", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/companies/search`, () => {
        return HttpResponse.json({
          items: [
            {
              cik: 320193,
              name: "Apple Inc.",
              ticker: "AAPL",
              exchange: "NASDAQ",
              entityType: "operating",
              sicCode: 3571,
              sicDescription: "Electronic Computers",
            },
          ],
          hasMore: false,
        });
      })
    );

    const client = createClient();
    const response = await client.companies.search({ q: "Apple" });

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.name).toBe("Apple Inc.");
    expect(response.items[0]?.ticker).toBe("AAPL");
  });
});
