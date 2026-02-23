import { ToolError } from "../../errors/ToolError.js";
import type { ExecutionContext, ToolCall, ToolResult } from "../../types/index.js";
import { ToolRegistry } from "../registry/ToolRegistry.js";
import { parseToolArguments } from "../utils/parseToolArguments.js";

export class ToolExecutor {
	constructor(
		private readonly registry: ToolRegistry,
		private readonly context: ExecutionContext,
	) {}

	async executeToolCall(toolCall: ToolCall): Promise<ToolResult> {
		try {
			const tool = this.registry.get(toolCall.function.name);

			if (!tool) {
				return {
					id: toolCall.id,
					name: toolCall.function.name,
					content: `Error: Unknown tool "${toolCall.function.name}"`,
					success: false,
					error: "Unknown tool",
				};
			}

			let parsedArgs: Record<string, unknown>;

			try {
				parsedArgs = parseToolArguments(tool.name, toolCall.function.arguments, tool.parameters);
			} catch (error) {
				const message = error instanceof Error ? error.message : "Invalid arguments";

				return {
					id: toolCall.id,
					name: tool.name,
					content: `Error: ${message}`,
					success: false,
					error: "Validation error",
				};
			}

			const result = await tool.execute(parsedArgs, this.context);

			return {
				...result,
				id: toolCall.id,
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			const errorType = error instanceof ToolError ? error.constructor.name : "Error";

			return {
				id: toolCall.id,
				name: toolCall.function.name,
				content: `Error: ${errorMessage}`,
				success: false,
				error: errorType,
			};
		}
	}

	async executeToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
		const results: ToolResult[] = [];

		for (const toolCall of toolCalls) {
			const result = await this.executeToolCall(toolCall);
			results.push(result);
		}

		return results;
	}
}
