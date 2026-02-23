import * as fs from "fs/promises";

import { SafetyError, ToolExecutionError } from "../../errors/ToolError.js";
import type { ExecutionContext, JSONSchema, Tool, ToolResult } from "../../types/index.js";
import { SafetyGuard } from "../safety/SafetyGuard.js";

export class ReadFileTool implements Tool {
	name = "read_file";
	description = "Read the contents of a file";
	parameters: JSONSchema = {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "Path to the file to read",
			},
		},
		required: ["path"],
	};

	async execute(params: unknown, context: ExecutionContext): Promise<ToolResult> {
		const { path } = params as { path: string };
		const safetyGuard = new SafetyGuard(context);

		try {
			// Validate path
			const safePath = await safetyGuard.validatePath(path);

			// Check if file exists
			const exists = await safetyGuard.fileExists(safePath);
			if (!exists) {
				return {
					id: crypto.randomUUID(),
					name: this.name,
					content: `Error: File not found: ${path}`,
					success: false,
					error: "File not found",
				};
			}

			// Read file
			const content = await fs.readFile(safePath, "utf-8");

			return {
				id: crypto.randomUUID(),
				name: this.name,
				content: `File: ${path}\n\n${content}`,
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
