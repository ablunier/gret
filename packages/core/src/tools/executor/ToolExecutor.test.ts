import { beforeEach, describe, expect, it } from "vitest";

import { ToolError } from "../../errors/ToolError.js";
import type {
	ExecutionContext,
	JSONSchema,
	Tool,
	ToolCall,
	ToolResult,
} from "../../types/index.js";
import { ToolRegistry } from "../registry/ToolRegistry.js";
import { ToolExecutor } from "./ToolExecutor.js";

// Mock tool that succeeds
class SuccessTool implements Tool {
	name = "success_tool";
	description = "A tool that always succeeds";
	parameters: JSONSchema = {
		type: "object",
		properties: {
			message: { type: "string", description: "Message to return" },
		},
		required: ["message"],
	};

	async execute(params: unknown): Promise<ToolResult> {
		const { message } = params as { message: string };

		return {
			id: crypto.randomUUID(),
			name: this.name,
			content: `Success: ${message}`,
			success: true,
		};
	}
}

// Mock tool that fails
class FailureTool implements Tool {
	name = "failure_tool";
	description = "A tool that always fails";
	parameters: JSONSchema = {
		type: "object",
		properties: {},
	};

	async execute(): Promise<ToolResult> {
		return {
			id: crypto.randomUUID(),
			name: this.name,
			content: "Tool-level failure",
			success: false,
			error: "Intentional failure",
		};
	}
}

// Mock tool that throws an error
class ErrorTool implements Tool {
	name = "error_tool";
	description = "A tool that throws an error";
	parameters: JSONSchema = {
		type: "object",
		properties: {},
	};

	async execute(): Promise<ToolResult> {
		throw new ToolError("Something went wrong", this.name);
	}
}

describe("ToolExecutor", () => {
	let registry: ToolRegistry;
	let context: ExecutionContext;
	let executor: ToolExecutor;

	beforeEach(() => {
		registry = new ToolRegistry();
		context = {
			workingDirectory: process.cwd(),
			allowedDirectories: ["."],
			requireConfirmation: false,
		};
		executor = new ToolExecutor(registry, context);
	});

	it("should execute a successful tool call", async () => {
		const tool = new SuccessTool();
		registry.register(tool);

		const toolCall: ToolCall = {
			id: "call-123",
			type: "function",
			function: {
				name: "success_tool",
				arguments: JSON.stringify({ message: "Hello" }),
			},
		};

		const result = await executor.executeToolCall(toolCall);

		expect(result.success).toBe(true);
		expect(result.id).toBe("call-123");
		expect(result.name).toBe("success_tool");
		expect(result.content).toContain("Hello");
	});

	it("should handle unknown tool", async () => {
		const toolCall: ToolCall = {
			id: "call-456",
			type: "function",
			function: {
				name: "unknown_tool",
				arguments: "{}",
			},
		};

		const result = await executor.executeToolCall(toolCall);

		expect(result.success).toBe(false);
		expect(result.id).toBe("call-456");
		expect(result.error).toBe("Unknown tool");
		expect(result.content).toContain("unknown_tool");
	});

	it("should handle invalid arguments", async () => {
		const tool = new SuccessTool();
		registry.register(tool);

		const toolCall: ToolCall = {
			id: "call-789",
			type: "function",
			function: {
				name: "success_tool",
				arguments: JSON.stringify({}), // Missing required 'message'
			},
		};

		const result = await executor.executeToolCall(toolCall);

		expect(result.success).toBe(false);
		expect(result.id).toBe("call-789");
		expect(result.error).toBe("Validation error");
		expect(result.content).toContain("message");
	});

	it("should handle malformed JSON arguments", async () => {
		const tool = new SuccessTool();
		registry.register(tool);

		const toolCall: ToolCall = {
			id: "call-abc",
			type: "function",
			function: {
				name: "success_tool",
				arguments: "not-valid-json",
			},
		};

		const result = await executor.executeToolCall(toolCall);

		expect(result.success).toBe(false);
		expect(result.id).toBe("call-abc");
		expect(result.error).toBe("Validation error");
	});

	it("should handle tool-level failures", async () => {
		const tool = new FailureTool();
		registry.register(tool);

		const toolCall: ToolCall = {
			id: "call-def",
			type: "function",
			function: {
				name: "failure_tool",
				arguments: "{}",
			},
		};

		const result = await executor.executeToolCall(toolCall);

		expect(result.success).toBe(false);
		expect(result.id).toBe("call-def");
		expect(result.error).toBe("Intentional failure");
	});

	it("should handle tool exceptions", async () => {
		const tool = new ErrorTool();
		registry.register(tool);

		const toolCall: ToolCall = {
			id: "call-ghi",
			type: "function",
			function: {
				name: "error_tool",
				arguments: "{}",
			},
		};

		const result = await executor.executeToolCall(toolCall);

		expect(result.success).toBe(false);
		expect(result.id).toBe("call-ghi");
		expect(result.content).toContain("Something went wrong");
	});

	it("should execute multiple tool calls", async () => {
		const successTool = new SuccessTool();
		const failureTool = new FailureTool();
		registry.register(successTool);
		registry.register(failureTool);

		const toolCalls: ToolCall[] = [
			{
				id: "call-1",
				type: "function",
				function: {
					name: "success_tool",
					arguments: JSON.stringify({ message: "First" }),
				},
			},
			{
				id: "call-2",
				type: "function",
				function: {
					name: "failure_tool",
					arguments: "{}",
				},
			},
			{
				id: "call-3",
				type: "function",
				function: {
					name: "success_tool",
					arguments: JSON.stringify({ message: "Third" }),
				},
			},
		];

		const results = await executor.executeToolCalls(toolCalls);

		expect(results).toHaveLength(3);
		expect(results[0].success).toBe(true);
		expect(results[0].content).toContain("First");
		expect(results[1].success).toBe(false);
		expect(results[2].success).toBe(true);
		expect(results[2].content).toContain("Third");
	});

	it("should preserve tool call IDs", async () => {
		const tool = new SuccessTool();
		registry.register(tool);

		const toolCalls: ToolCall[] = [
			{
				id: "unique-id-1",
				type: "function",
				function: {
					name: "success_tool",
					arguments: JSON.stringify({ message: "A" }),
				},
			},
			{
				id: "unique-id-2",
				type: "function",
				function: {
					name: "success_tool",
					arguments: JSON.stringify({ message: "B" }),
				},
			},
		];

		const results = await executor.executeToolCalls(toolCalls);

		expect(results[0].id).toBe("unique-id-1");
		expect(results[1].id).toBe("unique-id-2");
	});
});
