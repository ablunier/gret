/**
 * Type definitions for Apertus CLI
 */

/**
 * Message types for conversation management
 */

export type Message = UserMessage | AssistantMessage | SystemMessage | ToolMessage;

export interface UserMessage {
	role: "user";
	content: string;
}

export interface AssistantMessage {
	role: "assistant";
	content: string | null;
	toolCalls?: ToolCall[];
}

export interface SystemMessage {
	role: "system";
	content: string;
}

/** Tool result message */
export interface ToolMessage {
	role: "tool";
	content: string;
	toolCallId: string;
}

/** Tool call from LLM */
export interface ToolCall {
	id: string;
	type: "function";
	function: {
		name: string;
		arguments: string; // JSON string
	};
}

/**
 * Tool system types
 */

/** Tool definition for LLM */
export interface ToolDefinition {
	type: "function";
	function: {
		name: string;
		description: string;
		parameters: JSONSchema;
	};
}

/** Tool execution result */
export interface ToolResult {
	id: string;
	name: string;
	content: string;
	success: boolean;
	error?: string;
}

/** Tool implementation interface */
export interface Tool {
	name: string;
	description: string;
	parameters: JSONSchema;
	execute(params: unknown, context: ExecutionContext): Promise<ToolResult>;
}

/** Execution context for tools */
export interface ExecutionContext {
	workingDirectory: string;
	allowedDirectories: string[];
	requireConfirmation: boolean;
}

/** JSON Schema type (simplified) */
export interface JSONSchema {
	type: string;
	properties?: Record<string, JSONSchema>;
	required?: string[];
	description?: string;
	items?: JSONSchema;
	enum?: unknown[];
}

/**
 * Core API types for LLM provider implementations
 */

export interface LLMProvider {
	sendMessage(messages: Message[], options?: SendMessageOptions): Promise<LLMResponse>;
	streamMessage(messages: Message[], options?: SendMessageOptions): AsyncIterator<LLMStreamChunk>;
}

/** Options for sending messages to the LLM */
export interface SendMessageOptions {
	maxTokens?: number;
	temperature?: number;
	tools?: ToolDefinition[];
	stream?: boolean;
}

/** Complete response from LLM API */
export interface LLMResponse {
	id: string;
	model: string;
	message: AssistantMessage;
	usage: TokenUsage;
	finishReason: "stop" | "tool_calls" | "length" | "error";
}

/** Streaming chunk from LLM API */
export interface LLMStreamChunk {
	id: string;
	delta: {
		role?: "assistant";
		content?: string;
		toolCalls?: ToolCall[];
	};
	finishReason?: "stop" | "tool_calls" | "length";
}

/** Token usage statistics */
export interface TokenUsage {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
}

/**
 * Configuration types
 */

/** Main application configuration */
export interface ApertusConfig {
	version: string;
	defaultProvider: string;
	providers: Record<string, ProviderConfig>;
	tools: ToolConfig;
	ui: UIConfig;
}

/** Provider configuration */
export interface ProviderConfig {
	type: "publicai" | "custom";
	apiKey: string;
	baseUrl?: string;
	model?: string;
	maxTokens?: number;
	temperature?: number;
}

/** Tool system configuration */
export interface ToolConfig {
	requireConfirmation: boolean;
	allowedDirectories: string[];
	commandWhitelist: string[];
}

/** UI configuration */
export interface UIConfig {
	theme: "default" | "minimal";
	showTokenUsage: boolean;
}
