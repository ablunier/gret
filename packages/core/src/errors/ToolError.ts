/**
 * Tool-specific error types
 */

export class ToolError extends Error {
	constructor(
		message: string,
		public toolName: string,
		public details?: unknown,
	) {
		super(message);
		this.name = "ToolError";
	}
}

export class ToolValidationError extends ToolError {
	constructor(toolName: string, message: string, details?: unknown) {
		super(`Validation failed: ${message}`, toolName, details);
		this.name = "ToolValidationError";
	}
}

export class ToolExecutionError extends ToolError {
	constructor(
		toolName: string,
		message: string,
		public cause?: Error,
	) {
		super(`Execution failed: ${message}`, toolName);
		this.name = "ToolExecutionError";
	}
}

export class SafetyError extends ToolError {
	constructor(toolName: string, message: string) {
		super(`Safety check failed: ${message}`, toolName);
		this.name = "SafetyError";
	}
}
