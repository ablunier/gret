import * as fs from "fs/promises";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SafetyError } from "../../errors/ToolError.js";
import type { ExecutionContext } from "../../types/index.js";
import { ListDirectoryTool } from "./ListDirectoryTool.js";

describe("ListDirectoryTool", () => {
	let tool: ListDirectoryTool;
	let context: ExecutionContext;
	const testDir = path.join(process.cwd(), "test-files-list");

	beforeEach(async () => {
		tool = new ListDirectoryTool();
		context = {
			workingDirectory: process.cwd(),
			allowedDirectories: ["."],
			requireConfirmation: false,
		};

		// Create test directory with some files and subdirectories
		await fs.mkdir(testDir, { recursive: true });
		await fs.mkdir(path.join(testDir, "subdir"), { recursive: true });
		await fs.writeFile(path.join(testDir, "file1.txt"), "content1", "utf-8");
		await fs.writeFile(path.join(testDir, "file2.txt"), "content2", "utf-8");
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
		expect(tool.name).toBe("list_directory");
		expect(tool.description).toBeTruthy();
		expect(tool.parameters.required).toContain("path");
	});

	it("should list files and directories", async () => {
		const result = await tool.execute({ path: testDir }, context);

		expect(result.success).toBe(true);
		expect(result.content).toContain("Directory:");
		expect(result.content).toContain("FILE file1.txt");
		expect(result.content).toContain("FILE file2.txt");
		expect(result.content).toContain("DIR  subdir");
	});

	it("should handle non-existent directory", async () => {
		const result = await tool.execute({ path: path.join(testDir, "nonexistent") }, context);

		expect(result.success).toBe(false);
		expect(result.content).toContain("Directory not found");
	});

	it("should reject paths outside allowed directories", async () => {
		await expect(tool.execute({ path: "/etc" }, context)).rejects.toThrow(SafetyError);
	});

	it("should handle relative paths", async () => {
		const relativePath = path.relative(process.cwd(), testDir);
		const result = await tool.execute({ path: relativePath }, context);

		expect(result.success).toBe(true);
		expect(result.content).toContain("FILE file1.txt");
	});

	it("should list empty directory", async () => {
		const emptyDir = path.join(testDir, "empty");
		await fs.mkdir(emptyDir);

		const result = await tool.execute({ path: emptyDir }, context);

		expect(result.success).toBe(true);
		expect(result.content).toContain("Directory:");
		// Should not contain any FILE or DIR entries
		const lines = result.content.split("\n");
		const entryLines = lines.filter((line) => line.startsWith("FILE") || line.startsWith("DIR"));
		expect(entryLines.length).toBe(0);
	});
});
