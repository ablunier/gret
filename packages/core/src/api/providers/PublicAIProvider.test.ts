import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Message } from "../../types/index.js";
import { PublicAIProvider } from "./PublicAIProvider.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("PublicAIProvider", () => {
	let provider: PublicAIProvider;

	beforeEach(() => {
		provider = new PublicAIProvider({ apiKey: "test-key" });
		vi.clearAllMocks();
	});

	describe("sendMessage", () => {
		it("should send a message and parse response correctly", async () => {
			const mockResponse = {
				id: "chatcmpl-123",
				model: "apertus-1",
				choices: [
					{
						message: {
							role: "assistant",
							content: "Hello! How can I help you?",
						},
						finish_reason: "stop",
					},
				],
				usage: {
					prompt_tokens: 10,
					completion_tokens: 20,
					total_tokens: 30,
				},
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const messages: Message[] = [{ role: "user", content: "Hello" }];

			const result = await provider.sendMessage(messages);

			expect(result.id).toBe("chatcmpl-123");
			expect(result.message.content).toBe("Hello! How can I help you?");
			expect(result.usage.totalTokens).toBe(30);
			expect(result.finishReason).toBe("stop");
		});

		it("should handle authentication errors", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 401,
				json: async () => ({ error: { message: "Invalid API key" } }),
			});

			const messages: Message[] = [{ role: "user", content: "Hello" }];

			await expect(provider.sendMessage(messages)).rejects.toThrow("Invalid API key");
		});
	});
});
