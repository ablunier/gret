import * as fs from "fs/promises";

import { SafetyError, ToolExecutionError } from "../../errors/ToolError.js";
import type { ExecutionContext, JSONSchema, Tool, ToolResult } from "../../types/index.js";
import { SafetyGuard } from "../safety/SafetyGuard.js";

export class ListDirectoryTool implements Tool {
	name = "list_directory";
	description = "List files and directories in a path";
	parameters: JSONSchema = {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "Path to the directory to list",
			},
		},
		required: ["path"],
	};

	async execute(params: unknown, context: ExecutionContext): Promise<ToolResult> {
		const { path: dirPath } = params as { path: string };
		const safetyGuard = new SafetyGuard(context);

		try {
			const safePath = await safetyGuard.validatePath(dirPath);

			const exists = await safetyGuard.fileExists(safePath);
			if (!exists) {
				return {
					id: crypto.randomUUID(),
					name: this.name,
					content: `Error: Directory not found: ${dirPath}`,
					success: false,
					error: "Directory not found",
				};
			}

			const entries = await fs.readdir(safePath, { withFileTypes: true });

			const lines = entries.map((entry) => {
				const type = entry.isDirectory() ? "DIR" : "FILE";

				return `${type} ${entry.name}`;
			});

			const content = `Directory: ${dirPath}\n\n${lines.join("\n")}`;

			return {
				id: crypto.randomUUID(),
				name: this.name,
				content,
				success: true,
			};
		} catch (error) {
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
