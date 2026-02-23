import * as fs from "fs/promises";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SafetyError } from "../../errors/ToolError.js";
import type { ExecutionContext } from "../../types/index.js";
import { SearchFilesTool } from "./SearchFilesTool.js";

describe("SearchFilesTool", () => {
	let tool: SearchFilesTool;
	let context: ExecutionContext;
	const testDir = path.join(process.cwd(), "test-files-search");

	beforeEach(async () => {
		tool = new SearchFilesTool();
		context = {
			workingDirectory: process.cwd(),
			allowedDirectories: ["."],
			requireConfirmation: false,
		};

		// Create test directory structure
		await fs.mkdir(testDir, { recursive: true });
		await fs.mkdir(path.join(testDir, "subdir1"), { recursive: true });
		await fs.mkdir(path.join(testDir, "subdir2"), { recursive: true });
		await fs.mkdir(path.join(testDir, ".hidden"), { recursive: true });

		// Create test files
		await fs.writeFile(path.join(testDir, "file1.txt"), "content", "utf-8");
		await fs.writeFile(path.join(testDir, "file2.js"), "content", "utf-8");
		await fs.writeFile(path.join(testDir, "README.md"), "content", "utf-8");
		await fs.writeFile(path.join(testDir, "subdir1", "nested.txt"), "content", "utf-8");
		await fs.writeFile(path.join(testDir, "subdir2", "another.js"), "content", "utf-8");
		await fs.writeFile(path.join(testDir, ".hidden", "secret.txt"), "content", "utf-8");
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
		expect(tool.name).toBe("search_files");
		expect(tool.description).toBeTruthy();
		expect(tool.parameters.required).toContain("path");
		expect(tool.parameters.required).toContain("pattern");
	});

	it("should find files with exact match", async () => {
		const result = await tool.execute({ path: testDir, pattern: "file1.txt" }, context);

		expect(result.success).toBe(true);
		expect(result.content).toContain("Found 1 file(s)");
		expect(result.content).toContain("file1.txt");
	});

	it("should find files with wildcard pattern", async () => {
		const result = await tool.execute({ path: testDir, pattern: "*.txt" }, context);

		expect(result.success).toBe(true);
		expect(result.content).toContain("file1.txt");
		expect(result.content).toContain("nested.txt");
		expect(result.content).not.toContain("file2.js");
	});

	it("should find files with ? wildcard", async () => {
		const result = await tool.execute({ path: testDir, pattern: "file?.txt" }, context);

		expect(result.success).toBe(true);
		expect(result.content).toContain("file1.txt");
		expect(result.content).not.toContain("README.md");
	});

	it("should search recursively in subdirectories", async () => {
		const result = await tool.execute({ path: testDir, pattern: "*.js" }, context);

		expect(result.success).toBe(true);
		expect(result.content).toContain("file2.js");
		expect(result.content).toContain("another.js");
	});

	it("should skip hidden directories", async () => {
		const result = await tool.execute({ path: testDir, pattern: "*.txt" }, context);

		expect(result.success).toBe(true);
		expect(result.content).not.toContain("secret.txt");
	});

	it("should handle no matches", async () => {
		const result = await tool.execute({ path: testDir, pattern: "*.nonexistent" }, context);

		expect(result.success).toBe(true);
		expect(result.content).toContain("No files found");
	});

	it("should handle non-existent directory", async () => {
		const result = await tool.execute(
			{ path: path.join(testDir, "nonexistent"), pattern: "*.txt" },
			context,
		);

		expect(result.success).toBe(false);
		expect(result.content).toContain("Directory not found");
	});

	it("should reject paths outside allowed directories", async () => {
		await expect(tool.execute({ path: "/etc", pattern: "*.conf" }, context)).rejects.toThrow(
			SafetyError,
		);
	});

	it("should be case-insensitive", async () => {
		const result = await tool.execute({ path: testDir, pattern: "README.*" }, context);

		expect(result.success).toBe(true);
		expect(result.content).toContain("README.md");
	});
});
