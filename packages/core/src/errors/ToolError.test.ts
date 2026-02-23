import { describe, expect, it } from "vitest";

import { SafetyError, ToolError, ToolExecutionError, ToolValidationError } from "./ToolError.js";

describe("ToolError", () => {
	it("should create ToolError with message and toolName", () => {
		const error = new ToolError("Something went wrong", "test_tool");
		expect(error.message).toBe("Something went wrong");
		expect(error.toolName).toBe("test_tool");
		expect(error.name).toBe("ToolError");
	});

	it("should create ToolError with details", () => {
		const details = { code: "ENOENT" };
		const error = new ToolError("File not found", "read_file", details);
		expect(error.details).toEqual(details);
	});
});

describe("ToolValidationError", () => {
	it("should create ToolValidationError with formatted message", () => {
		const error = new ToolValidationError("test_tool", "Invalid parameters");
		expect(error.message).toBe("Validation failed: Invalid parameters");
		expect(error.toolName).toBe("test_tool");
		expect(error.name).toBe("ToolValidationError");
	});
});

describe("ToolExecutionError", () => {
	it("should create ToolExecutionError with cause", () => {
		const cause = new Error("Underlying error");
		const error = new ToolExecutionError("test_tool", "Failed to execute", cause);
		expect(error.message).toBe("Execution failed: Failed to execute");
		expect(error.cause).toBe(cause);
		expect(error.name).toBe("ToolExecutionError");
	});
});

describe("SafetyError", () => {
	it("should create SafetyError with formatted message", () => {
		const error = new SafetyError("test_tool", "Path outside allowed directories");
		expect(error.message).toBe("Safety check failed: Path outside allowed directories");
		expect(error.toolName).toBe("test_tool");
		expect(error.name).toBe("SafetyError");
	});
});
