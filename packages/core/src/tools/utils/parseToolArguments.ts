import { ToolValidationError } from "../../errors/ToolError.js";
import type { JSONSchema } from "../../types/index.js";

/**
 * Parse tool arguments from JSON string and validate against schema
 */
export function parseToolArguments(
	toolName: string,
	argumentsJson: string,
	schema: JSONSchema,
): Record<string, unknown> {
	try {
		const parsed = JSON.parse(argumentsJson);

		// Basic validation - check required fields
		if (schema.required) {
			for (const field of schema.required) {
				if (!(field in parsed)) {
					throw new ToolValidationError(toolName, `Missing required parameter: ${field}`);
				}
			}
		}

		return parsed;
	} catch (error) {
		if (error instanceof ToolValidationError) {
			throw error;
		}
		throw new ToolValidationError(
			toolName,
			`Invalid JSON arguments: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}
