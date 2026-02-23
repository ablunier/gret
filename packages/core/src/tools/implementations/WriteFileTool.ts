import * as fs from "fs/promises";
import * as path from "path";

import { SafetyError, ToolExecutionError } from "../../errors/ToolError.js";
import type { ExecutionContext, JSONSchema, Tool, ToolResult } from "../../types/index.js";
import { type ConfirmationHandler, SafetyGuard } from "../safety/SafetyGuard.js";

export class WriteFileTool implements Tool {
	name = "write_file";
	description = "Write content to a file (creates or overwrites)";
	parameters: JSONSchema = {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "Path to the file to write",
			},
			content: {
				type: "string",
				description: "Content to write to the file",
			},
		},
		required: ["path", "content"],
	};

	constructor(private readonly confirmationHandler?: ConfirmationHandler) {}

	async execute(params: unknown, context: ExecutionContext): Promise<ToolResult> {
		const { path: filePath, content } = params as { path: string; content: string };
		const safetyGuard = new SafetyGuard(context, this.confirmationHandler);

		try {
			// Validate path
			const safePath = await safetyGuard.validatePath(filePath);

			// Check if file exists
			const exists = await safetyGuard.fileExists(safePath);

			// Request confirmation
			const action = exists ? "Overwrite" : "Create";
			await safetyGuard.requestConfirmation(
				`${action} file: ${filePath}\nSize: ${content.length} bytes`,
			);

			// Create directory if needed
			await fs.mkdir(path.dirname(safePath), { recursive: true });

			// Write file
			await fs.writeFile(safePath, content, "utf-8");

			return {
				id: crypto.randomUUID(),
				name: this.name,
				content: `Successfully wrote ${content.length} bytes to ${filePath}`,
				success: true,
			};
		} catch (error) {
			// Re-throw SafetyError directly for proper error handling
			if (error instanceof SafetyError) {
				throw error;
			}
			if (error instanceof Error) {
				throw new ToolExecutionError(this.name, error.message, error);
			}
			throw error;
		}
	}
}
