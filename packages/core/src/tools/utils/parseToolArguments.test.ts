import { describe, expect, it } from "vitest";

import { ToolValidationError } from "../../errors/ToolError.js";
import { parseToolArguments } from "./parseToolArguments.js";

describe("parseToolArguments", () => {
	it("should parse valid JSON arguments", () => {
		const schema = {
			type: "object",
			properties: { path: { type: "string" } },
			required: ["path"],
		};

		const result = parseToolArguments("test_tool", '{"path": "/test/file.txt"}', schema);

		expect(result).toEqual({ path: "/test/file.txt" });
	});

	it("should parse arguments with multiple fields", () => {
		const schema = {
			type: "object",
			properties: {
				path: { type: "string" },
				content: { type: "string" },
			},
			required: ["path", "content"],
		};

		const result = parseToolArguments(
			"test_tool",
			'{"path": "/test.txt", "content": "Hello"}',
			schema,
		);

		expect(result).toEqual({ path: "/test.txt", content: "Hello" });
	});

	it("should throw on missing required field", () => {
		const schema = {
			type: "object",
			properties: { path: { type: "string" } },
			required: ["path"],
		};

		expect(() => {
			parseToolArguments("test_tool", "{}", schema);
		}).toThrow(ToolValidationError);

		expect(() => {
			parseToolArguments("test_tool", "{}", schema);
		}).toThrow("Missing required parameter: path");
	});

	it("should throw on invalid JSON", () => {
		const schema = { type: "object", properties: {}, required: [] };

		expect(() => {
			parseToolArguments("test_tool", "not json", schema);
		}).toThrow(ToolValidationError);

		expect(() => {
			parseToolArguments("test_tool", "not json", schema);
		}).toThrow("Invalid JSON arguments");
	});

	it("should handle schema without required fields", () => {
		const schema = {
			type: "object",
			properties: { path: { type: "string" } },
		};

		const result = parseToolArguments("test_tool", '{"path": "/test.txt"}', schema);

		expect(result).toEqual({ path: "/test.txt" });
	});

	it("should allow extra fields not in schema", () => {
		const schema = {
			type: "object",
			properties: { path: { type: "string" } },
			required: ["path"],
		};

		const result = parseToolArguments(
			"test_tool",
			'{"path": "/test.txt", "extra": "field"}',
			schema,
		);

		expect(result).toEqual({ path: "/test.txt", extra: "field" });
	});
});
