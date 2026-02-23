import * as fs from "fs/promises";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SafetyError } from "../../errors/ToolError.js";
import type { ExecutionContext } from "../../types/index.js";
import { WriteFileTool } from "./WriteFileTool.js";

describe("WriteFileTool", () => {
	let tool: WriteFileTool;
	let context: ExecutionContext;
	const testDir = path.join(process.cwd(), "test-files-write");

	beforeEach(async () => {
		tool = new WriteFileTool();
		context = {
			workingDirectory: process.cwd(),
			allowedDirectories: ["."],
			requireConfirmation: false,
		};

		// Create test directory
		await fs.mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		// Clean up test directory
		try {
			await fs.rm(testDir, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	it("should have correct metadata", () => {
		expect(tool.name).toBe("write_file");
		expect(tool.description).toBeTruthy();
		expect(tool.parameters.required).toContain("path");
		expect(tool.parameters.required).toContain("content");
	});

	it("should write content to a new file", async () => {
		const filePath = path.join(testDir, "test.txt");
		const content = "Hello, World!";

		const result = await tool.execute({ path: filePath, content }, context);

		expect(result.success).toBe(true);
		expect(result.content).toContain("Successfully wrote");
		expect(result.content).toContain("13 bytes");

		// Verify file was created
		const fileContent = await fs.readFile(filePath, "utf-8");
		expect(fileContent).toBe(content);
	});

	it("should overwrite existing file", async () => {
		const filePath = path.join(testDir, "existing.txt");

		// Create initial file
		await fs.writeFile(filePath, "Initial content", "utf-8");

		// Overwrite with new content
		const newContent = "New content";
		const result = await tool.execute({ path: filePath, content: newContent }, context);

		expect(result.success).toBe(true);

		// Verify file was overwritten
		const fileContent = await fs.readFile(filePath, "utf-8");
		expect(fileContent).toBe(newContent);
	});

	it("should create nested directories", async () => {
		const filePath = path.join(testDir, "nested/dir/file.txt");
		const content = "Nested file";

		const result = await tool.execute({ path: filePath, content }, context);

		expect(result.success).toBe(true);

		// Verify file was created in nested directory
		const fileContent = await fs.readFile(filePath, "utf-8");
		expect(fileContent).toBe(content);
	});

	it("should reject paths outside allowed directories", async () => {
		await expect(tool.execute({ path: "/etc/test.txt", content: "test" }, context)).rejects.toThrow(
			SafetyError,
		);
	});

	it("should request confirmation when enabled", async () => {
		context.requireConfirmation = true;
		const mockHandler = {
			confirm: vi.fn().mockResolvedValue(true),
		};
		tool = new WriteFileTool(mockHandler);

		const filePath = path.join(testDir, "confirm.txt");
		await tool.execute({ path: filePath, content: "test" }, context);

		expect(mockHandler.confirm).toHaveBeenCalled();
		expect(mockHandler.confirm).toHaveBeenCalledWith(expect.stringContaining("Create file"));
	});

	it("should throw when user rejects confirmation", async () => {
		context.requireConfirmation = true;
		const mockHandler = {
			confirm: vi.fn().mockResolvedValue(false),
		};
		tool = new WriteFileTool(mockHandler);

		await expect(
			tool.execute({ path: path.join(testDir, "reject.txt"), content: "test" }, context),
		).rejects.toThrow(SafetyError);
	});
});
