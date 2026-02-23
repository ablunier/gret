import { beforeEach, describe, expect, it } from "vitest";

import type { ExecutionContext, JSONSchema, Tool, ToolResult } from "../../types/index.js";
import { ToolRegistry } from "./ToolRegistry.js";

// Mock tool for testing
class MockTool implements Tool {
	name = "mock_tool";
	description = "A mock tool for testing";
	parameters: JSONSchema = {
		type: "object",
		properties: {
			param1: { type: "string", description: "First parameter" },
		},
		required: ["param1"],
	};

	async execute(_params: unknown, _context: ExecutionContext): Promise<ToolResult> {
		return {
			id: crypto.randomUUID(),
			name: this.name,
			content: "Mock result",
			success: true,
		};
	}
}

class AnotherMockTool implements Tool {
	name = "another_tool";
	description = "Another mock tool";
	parameters: JSONSchema = {
		type: "object",
		properties: {},
	};

	async execute(_params: unknown, _context: ExecutionContext): Promise<ToolResult> {
		return {
			id: crypto.randomUUID(),
			name: this.name,
			content: "Another result",
			success: true,
		};
	}
}

describe("ToolRegistry", () => {
	let registry: ToolRegistry;
	let mockTool: MockTool;
	let anotherTool: AnotherMockTool;

	beforeEach(() => {
		registry = new ToolRegistry();
		mockTool = new MockTool();
		anotherTool = new AnotherMockTool();
	});

	it("should register a tool", () => {
		registry.register(mockTool);
		expect(registry.has("mock_tool")).toBe(true);
		expect(registry.size()).toBe(1);
	});

	it("should get a registered tool", () => {
		registry.register(mockTool);
		const retrieved = registry.get("mock_tool");
		expect(retrieved).toBe(mockTool);
	});

	it("should return undefined for unregistered tool", () => {
		const retrieved = registry.get("nonexistent");
		expect(retrieved).toBeUndefined();
	});

	it("should register multiple tools", () => {
		registry.register(mockTool);
		registry.register(anotherTool);
		expect(registry.size()).toBe(2);
		expect(registry.has("mock_tool")).toBe(true);
		expect(registry.has("another_tool")).toBe(true);
	});

	it("should get all registered tools", () => {
		registry.register(mockTool);
		registry.register(anotherTool);
		const allTools = registry.getAll();
		expect(allTools).toHaveLength(2);
		expect(allTools).toContain(mockTool);
		expect(allTools).toContain(anotherTool);
	});

	it("should check if tool exists", () => {
		registry.register(mockTool);
		expect(registry.has("mock_tool")).toBe(true);
		expect(registry.has("nonexistent")).toBe(false);
	});

	it("should clear all tools", () => {
		registry.register(mockTool);
		registry.register(anotherTool);
		expect(registry.size()).toBe(2);

		registry.clear();
		expect(registry.size()).toBe(0);
		expect(registry.has("mock_tool")).toBe(false);
	});

	it("should get tool definitions for LLM API", () => {
		registry.register(mockTool);
		registry.register(anotherTool);

		const definitions = registry.getToolDefinitions();

		expect(definitions).toHaveLength(2);
		expect(definitions[0]).toEqual({
			type: "function",
			function: {
				name: "mock_tool",
				description: "A mock tool for testing",
				parameters: {
					type: "object",
					properties: {
						param1: { type: "string", description: "First parameter" },
					},
					required: ["param1"],
				},
			},
		});
	});

	it("should overwrite tool if registered twice", () => {
		const firstTool = new MockTool();
		const secondTool = new MockTool();

		registry.register(firstTool);
		registry.register(secondTool);

		expect(registry.size()).toBe(1);
		expect(registry.get("mock_tool")).toBe(secondTool);
	});

	it("should return empty array when no tools registered", () => {
		expect(registry.getAll()).toEqual([]);
		expect(registry.getToolDefinitions()).toEqual([]);
		expect(registry.size()).toBe(0);
	});
});
