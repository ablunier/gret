import type { ExecutionContext, JSONSchema, Tool, ToolResult } from "../../types/index.js";

export class RunCommandTool implements Tool {
	name = "run_command";
	description = "Execute a shell command (stub - not yet implemented)";
	parameters: JSONSchema = {
		type: "object",
		properties: {
			command: {
				type: "string",
				description: "Shell command to execute",
			},
			workingDirectory: {
				type: "string",
				description: "Working directory for command execution (optional)",
			},
		},
		required: ["command"],
	};

	async execute(_params: unknown, _context: ExecutionContext): Promise<ToolResult> {
		// Stub implementation - will be fully implemented in Phase 3
		return {
			id: crypto.randomUUID(),
			name: this.name,
			content:
				"Error: Command execution is not yet implemented. This feature will be available in Phase 3.",
			success: false,
			error: "Not implemented",
		};
	}
}
