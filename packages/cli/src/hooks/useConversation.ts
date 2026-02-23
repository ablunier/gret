import type {
	ApertusConfig,
	ConfirmationHandler,
	ExecutionContext,
	Message,
	ProviderConfig,
	TokenUsage,
	ToolCall,
	ToolDefinition,
	ToolMessage,
	ToolResult,
} from "@ablunier/apertus-core";
import { createToolRegistry, PublicAIProvider, ToolExecutor } from "@ablunier/apertus-core";
import { useCallback, useRef, useState } from "react";

export type ConversationStatus = "idle" | "thinking" | "tool_executing" | "error";

export interface ConversationState {
	messages: Message[];
	status: ConversationStatus;
	error: string | null;
	currentToolCalls: ToolCall[];
	currentToolResults: ToolResult[];
	tokenUsage: TokenUsage | null;
}

export interface UseConversationOptions {
	providerConfig: ProviderConfig;
	config: ApertusConfig;
	confirmationHandler: ConfirmationHandler;
	onToolExecution?: (toolCall: ToolCall) => void;
	onToolResult?: (result: ToolResult) => void;
}

export interface UseConversationReturn {
	state: ConversationState;
	sendMessage: (content: string) => Promise<void>;
	clearMessages: () => void;
	isReady: boolean;
}

export function useConversation(options: UseConversationOptions): UseConversationReturn {
	const { providerConfig, config, confirmationHandler, onToolExecution, onToolResult } = options;

	const [state, setState] = useState<ConversationState>({
		messages: [],
		status: "idle",
		error: null,
		currentToolCalls: [],
		currentToolResults: [],
		tokenUsage: null,
	});

	const providerRef = useRef<PublicAIProvider | null>(null);
	const toolExecutorRef = useRef<ToolExecutor | null>(null);
	const toolsRef = useRef<ToolDefinition[]>([]);

	// Initialize provider and tools lazily
	const initializeIfNeeded = useCallback(() => {
		providerRef.current ??= new PublicAIProvider({
			apiKey: providerConfig.apiKey,
			model: providerConfig.model,
			maxTokens: providerConfig.maxTokens,
			temperature: providerConfig.temperature,
		});

		if (!toolExecutorRef.current) {
			const toolRegistry = createToolRegistry(confirmationHandler);
			const context: ExecutionContext = {
				workingDirectory: process.cwd(),
				allowedDirectories: ["."],
				requireConfirmation: config.tools.requireConfirmation,
			};
			toolExecutorRef.current = new ToolExecutor(toolRegistry, context);
			toolsRef.current = toolRegistry.getToolDefinitions();
		}
	}, [providerConfig, config, confirmationHandler]);

	const sendMessage = useCallback(
		async (content: string) => {
			initializeIfNeeded();

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const provider = providerRef.current!;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const toolExecutor = toolExecutorRef.current!;
			const tools = toolsRef.current;

			// Add user message
			const userMessage: Message = { role: "user", content };
			const messages: Message[] = [...state.messages, userMessage];

			setState((prev) => ({
				...prev,
				messages,
				status: "thinking",
				error: null,
				currentToolCalls: [],
				currentToolResults: [],
			}));

			let turnCount = 0;
			const maxTurns = 10;

			try {
				while (turnCount < maxTurns) {
					turnCount++;

					// Send to LLM
					const response = await provider.sendMessage(messages, { tools });

					// Add assistant message
					messages.push(response.message);

					// Update state with new message
					setState((prev) => ({
						...prev,
						messages: [...messages],
						tokenUsage: response.usage,
					}));

					// Handle tool calls
					if (response.finishReason === "tool_calls" && response.message.toolCalls) {
						setState((prev) => ({
							...prev,
							status: "tool_executing",
							currentToolCalls: response.message.toolCalls ?? [],
						}));

						// Notify about tool execution
						for (const toolCall of response.message.toolCalls) {
							onToolExecution?.(toolCall);
						}

						// Execute tools
						const toolResults = await toolExecutor.executeToolCalls(response.message.toolCalls);

						// Notify about results
						for (const result of toolResults) {
							onToolResult?.(result);
						}

						setState((prev) => ({
							...prev,
							currentToolResults: toolResults,
						}));

						// Add tool results to conversation
						const toolMessages: ToolMessage[] = toolResults.map((result) => ({
							role: "tool" as const,
							content: result.content,
							toolCallId: result.id,
						}));
						messages.push(...toolMessages);

						setState((prev) => ({
							...prev,
							messages: [...messages],
							status: "thinking",
						}));

						continue;
					} else if (response.finishReason === "stop") {
						// Conversation complete
						setState((prev) => ({
							...prev,
							messages: [...messages],
							status: "idle",
							tokenUsage: response.usage,
						}));
						break;
					} else {
						// Handle other finish reasons (length, error)
						setState((prev) => ({
							...prev,
							messages: [...messages],
							status: "idle",
							error: `Conversation ended: ${response.finishReason}`,
						}));
						break;
					}
				}

				if (turnCount >= maxTurns) {
					setState((prev) => ({
						...prev,
						status: "error",
						error: "Maximum turns reached",
					}));
				}
			} catch (error) {
				setState((prev) => ({
					...prev,
					status: "error",
					error: error instanceof Error ? error.message : "Unknown error",
				}));
			}
		},
		[state.messages, initializeIfNeeded, onToolExecution, onToolResult],
	);

	const clearMessages = useCallback(() => {
		setState({
			messages: [],
			status: "idle",
			error: null,
			currentToolCalls: [],
			currentToolResults: [],
			tokenUsage: null,
		});
	}, []);

	const isReady = !!providerConfig.apiKey;

	return {
		state,
		sendMessage,
		clearMessages,
		isReady,
	};
}
