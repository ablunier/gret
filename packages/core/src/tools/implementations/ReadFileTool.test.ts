import { beforeEach, describe, expect, it } from "vitest";

import { SafetyError } from "../../errors/ToolError.js";
import type { ExecutionContext } from "../../types/index.js";
import { ReadFileTool } from "./ReadFileTool.js";

describe("ReadFileTool", () => {
	let tool: ReadFileTool;
	let context: ExecutionContext;

	beforeEach(() => {
		tool = new ReadFileTool();
		context = {
			workingDirectory: process.cwd(),
			allowedDirectories: ["."],
			requireConfirmation: false,
		};
	});

	it("should have correct metadata", () => {
		expect(tool.name).toBe("read_file");
		expect(tool.description).toBeTruthy();
		expect(tool.parameters.required).toContain("path");
	});

	it("should read an existing file", async () => {
		// Read package.json which we know exists
		const result = await tool.execute({ path: "./package.json" }, context);

		expect(result.success).toBe(true);
		expect(result.name).toBe("read_file");
		expect(result.content).toContain("package.json");
		expect(result.content).toContain('"name"');
	});

	it("should return error for non-existent file", async () => {
		const result = await tool.execute({ path: "./nonexistent-file-123.txt" }, context);

		expect(result.success).toBe(false);
		expect(result.error).toBe("File not found");
		expect(result.content).toContain("File not found");
	});

	it("should reject paths outside allowed directories", async () => {
		await expect(tool.execute({ path: "/etc/passwd" }, context)).rejects.toThrow(SafetyError);
	});

	it("should handle relative paths", async () => {
		const result = await tool.execute({ path: "./package.json" }, context);
		expect(result.success).toBe(true);
	});
});
