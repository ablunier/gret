import type {
	LLMProvider,
	LLMResponse,
	LLMStreamChunk,
	Message,
	SendMessageOptions,
} from "../../types/index.js";
import { ApiError, AuthenticationError, NetworkError } from "../errors/ApiError.js";

export interface ProviderOptions {
	apiKey: string;
	baseUrl: string;
	model: string;
	maxTokens?: number;
	temperature?: number;
}

export abstract class BaseProvider implements LLMProvider {
	protected apiKey: string;
	protected baseUrl: string;
	protected model: string;
	protected maxTokens: number;
	protected temperature: number;

	constructor(options: ProviderOptions) {
		this.apiKey = options.apiKey;
		this.baseUrl = options.baseUrl;
		this.model = options.model;
		this.maxTokens = options.maxTokens ?? 4096;
		this.temperature = options.temperature ?? 0.7;
	}

	abstract sendMessage(messages: Message[], options?: SendMessageOptions): Promise<LLMResponse>;
	abstract streamMessage(
		messages: Message[],
		options?: SendMessageOptions,
	): AsyncIterator<LLMStreamChunk>;

	protected async fetchWithErrorHandling(url: string, options: RequestInit): Promise<Response> {
		try {
			const response = await fetch(url, {
				...options,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.apiKey}`,
					"User-Agent": "apertus-cli/0.1.0",
					...options.headers,
				},
			});

			if (!response.ok) {
				await this.handleErrorResponse(response);
			}

			return response;
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new NetworkError(
				`Network request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				error instanceof Error ? error : undefined,
			);
		}
	}

	protected async handleErrorResponse(response: Response): Promise<never> {
		let errorData: any;
		try {
			errorData = await response.json();
		} catch {
			errorData = { message: await response.text() };
		}

		const errorMessage = errorData?.error?.message ?? errorData?.message ?? "API request failed";

		if (response.status === 401 || response.status === 403) {
			throw new AuthenticationError(errorMessage);
		}

		throw new ApiError(errorMessage, response.status, errorData);
	}
}
