import * as fs from "fs/promises";
import * as path from "path";

import { SafetyError, ToolExecutionError } from "../../errors/ToolError.js";
import type { ExecutionContext, JSONSchema, Tool, ToolResult } from "../../types/index.js";
import { SafetyGuard } from "../safety/SafetyGuard.js";

export class SearchFilesTool implements Tool {
	name = "search_files";
	description = "Search for files by name pattern (supports * and ? wildcards)";
	parameters: JSONSchema = {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "Directory to search in",
			},
			pattern: {
				type: "string",
				description: "File name pattern with wildcards (* and ?)",
			},
		},
		required: ["path", "pattern"],
	};

	async execute(params: unknown, context: ExecutionContext): Promise<ToolResult> {
		const { path: searchPath, pattern } = params as { path: string; pattern: string };
		const safetyGuard = new SafetyGuard(context);

		try {
			// Validate path
			const safePath = await safetyGuard.validatePath(searchPath);

			// Check if directory exists
			const exists = await safetyGuard.fileExists(safePath);
			if (!exists) {
				return {
					id: crypto.randomUUID(),
					name: this.name,
					content: `Error: Directory not found: ${searchPath}`,
					success: false,
					error: "Directory not found",
				};
			}

			// Convert glob pattern to regex
			const regex = this.patternToRegex(pattern);

			// Search recursively
			const matches = await this.searchRecursive(safePath, regex, searchPath);

			if (matches.length === 0) {
				return {
					id: crypto.randomUUID(),
					name: this.name,
					content: `No files found matching pattern: ${pattern}`,
					success: true,
				};
			}

			const content = `Found ${matches.length} file(s) matching "${pattern}":\n\n${matches.join("\n")}`;

			return {
				id: crypto.randomUUID(),
				name: this.name,
				content,
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

	private patternToRegex(pattern: string): RegExp {
		// Escape special regex characters except * and ?
		const escaped = pattern
			.replace(/[.+^${}()|[\]\\]/g, "\\$&")
			.replace(/\*/g, ".*")
			.replace(/\?/g, ".");

		return new RegExp(`^${escaped}$`, "i");
	}

	private async searchRecursive(
		dirPath: string,
		regex: RegExp,
		basePath: string,
	): Promise<string[]> {
		const matches: string[] = [];

		try {
			const entries = await fs.readdir(dirPath, { withFileTypes: true });

			for (const entry of entries) {
				// Skip node_modules and hidden directories
				if (entry.name === "node_modules" || entry.name.startsWith(".")) {
					continue;
				}

				const fullPath = path.join(dirPath, entry.name);

				if (entry.isDirectory()) {
					// Recursively search subdirectories
					const subMatches = await this.searchRecursive(fullPath, regex, basePath);
					matches.push(...subMatches);
				} else if (entry.isFile() && regex.test(entry.name)) {
					// Add matching file (relative to search base)
					const relativePath = path.relative(basePath, fullPath);
					matches.push(relativePath);
				}
			}
		} catch (_error) {
			// Skip directories we can't read (permission issues, etc.)
		}

		return matches;
	}
}
