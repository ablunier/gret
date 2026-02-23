import type {
	AssistantMessage,
	LLMResponse,
	LLMStreamChunk,
	Message,
	SendMessageOptions,
} from "../../types/index.js";
import { ApiError } from "../errors/ApiError.js";
import { BaseProvider, type ProviderOptions } from "./BaseProvider.js";

interface PublicAIProviderOptions extends Partial<ProviderOptions> {
	apiKey: string;
}

export class PublicAIProvider extends BaseProvider {
	constructor(options: PublicAIProviderOptions) {
		super({
			apiKey: options.apiKey,
			baseUrl: options.baseUrl ?? "https://api.publicai.co",
			model: options.model ?? "swiss-ai/apertus-8b-instruct",
			maxTokens: options.maxTokens,
			temperature: options.temperature,
		});
	}

	async sendMessage(messages: Message[], options?: SendMessageOptions): Promise<LLMResponse> {
		const requestBody = this.buildRequestBody(messages, options, false);

		console.log(requestBody.tools);

		const response = await this.fetchWithErrorHandling(`${this.baseUrl}/v1/chat/completions`, {
			method: "POST",
			body: JSON.stringify(requestBody),
		});

		const data = await response.json();
		const parsedResponse = this.parseResponse(data);

		console.log(parsedResponse);

		return parsedResponse;
	}

	/**
	 * Stream message responses (stub for Phase 1)
	 */
	async *streamMessage(
		messages: Message[],
		options?: SendMessageOptions,
	): AsyncIterator<LLMStreamChunk> {
		// For Phase 1, we'll implement basic non-streaming version
		// Phase 4 will add true streaming support
		const response = await this.sendMessage(messages, options);

		yield {
			id: response.id,
			delta: {
				role: "assistant",
				content: response.message.content ?? undefined,
				toolCalls: response.message.toolCalls,
			},
			finishReason: response.finishReason === "error" ? undefined : response.finishReason,
		};
	}

	private buildRequestBody(
		messages: Message[],
		options: SendMessageOptions | undefined,
		stream: boolean,
	) {
		return {
			model: this.model,
			messages: this.formatMessages(messages),
			max_tokens: options?.maxTokens ?? this.maxTokens,
			temperature: options?.temperature ?? this.temperature,
			stream,
			...(options?.tools && { tools: options.tools }),
		};
	}

	private formatMessages(messages: Message[]) {
		return messages.map((msg) => {
			if (msg.role === "tool") {
				return {
					role: "tool",
					content: msg.content,
					tool_call_id: msg.toolCallId,
				};
			}

			if (msg.role === "assistant" && msg.toolCalls) {
				return {
					role: "assistant",
					content: msg.content,
					tool_calls: msg.toolCalls.map((tc) => ({
						id: tc.id,
						type: tc.type,
						function: {
							name: tc.function.name,
							arguments: tc.function.arguments,
						},
					})),
				};
			}

			return {
				role: msg.role,
				content: msg.content,
			};
		});
	}

	private parseResponse(data: any): LLMResponse {
		if (!data.choices || data.choices.length === 0) {
			throw new ApiError("Invalid response: no choices returned");
		}

		const choice = data.choices[0];
		const message: AssistantMessage = {
			role: "assistant",
			content: choice.message.content,
			toolCalls: choice.message.tool_calls?.map((tc: any) => ({
				id: tc.id,
				type: tc.type,
				function: {
					name: tc.function.name,
					arguments: tc.function.arguments,
				},
			})),
		};

		return {
			id: data.id,
			model: data.model,
			message,
			usage: {
				promptTokens: data.usage?.prompt_tokens ?? 0,
				completionTokens: data.usage?.completion_tokens ?? 0,
				totalTokens: data.usage?.total_tokens ?? 0,
			},
			finishReason: this.mapFinishReason(choice.finish_reason),
		};
	}

	private mapFinishReason(reason: string): "stop" | "tool_calls" | "length" | "error" {
		switch (reason) {
			case "stop":
				return "stop";
			case "tool_calls":
				return "tool_calls";
			case "length":
				return "length";
			default:
				return "error";
		}
	}
}
