/**
 * Custom error classes for Earnings Feed API client.
 */

/** Base error class for Earnings Feed API errors. */
export class EarningsFeedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EarningsFeedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Raised when API key is missing or invalid. */
export class AuthenticationError extends EarningsFeedError {
  constructor(message = "Invalid or missing API key") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/** Raised when rate limit is exceeded. */
export class RateLimitError extends EarningsFeedError {
  /** Unix timestamp when rate limit resets */
  resetAt?: number;

  constructor(message = "Rate limit exceeded", resetAt?: number) {
    super(message);
    this.name = "RateLimitError";
    this.resetAt = resetAt;
  }
}

/** Raised when a resource is not found. */
export class NotFoundError extends EarningsFeedError {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Raised when request parameters are invalid. */
export class ValidationError extends EarningsFeedError {
  constructor(message = "Invalid request parameters") {
    super(message);
    this.name = "ValidationError";
  }
}

/** Raised for general API errors. */
export class APIError extends EarningsFeedError {
  /** HTTP status code */
  statusCode?: number;
  /** API error code */
  code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
