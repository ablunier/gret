/**
 * @ablunier/apertus-core - Core business logic and API clients
 * @module @ablunier/apertus-core
 */

// Re-export types from local types directory
export type * from "./types/index.js";

// API exports
export {
	ApiError,
	AuthenticationError,
	BaseProvider,
	NetworkError,
	PublicAIProvider,
	RateLimitError,
} from "./api/index.js";

// Config exports
export { ApertusConfigSchema, ConfigStore, ProviderConfigSchema } from "./config/index.js";

// Error exports
export {
	SafetyError,
	ToolError,
	ToolExecutionError,
	ToolValidationError,
} from "./errors/ToolError.js";

// Tool exports
export type { ConfirmationHandler } from "./tools/index.js";
export {
	createToolRegistry,
	ListDirectoryTool,
	parseToolArguments,
	ReadFileTool,
	RunCommandTool,
	SafetyGuard,
	SearchFilesTool,
	ToolExecutor,
	ToolRegistry,
	WriteFileTool,
} from "./tools/index.js";
