/**
 * Custom error types for API interactions
 */

export class ApiError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public response?: unknown,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export class AuthenticationError extends ApiError {
	constructor(message: string = "Authentication failed") {
		super(message, 401);
		this.name = "AuthenticationError";
	}
}

export class RateLimitError extends ApiError {
	constructor(
		message: string = "Rate limit exceeded",
		public retryAfter?: number,
	) {
		super(message, 429);
		this.name = "RateLimitError";
	}
}

export class NetworkError extends ApiError {
	constructor(
		message: string,
		public cause?: Error,
	) {
		super(message);
		this.name = "NetworkError";
	}
}
