import { beforeEach, describe, expect, it, vi } from "vitest";

import { SafetyError } from "../../errors/ToolError.js";
import type { ExecutionContext } from "../../types/index.js";
import { type ConfirmationHandler, SafetyGuard } from "./SafetyGuard.js";

describe("SafetyGuard", () => {
	let context: ExecutionContext;
	let safetyGuard: SafetyGuard;

	beforeEach(() => {
		context = {
			workingDirectory: "/home/user/project",
			allowedDirectories: [".", "./src"],
			requireConfirmation: false,
		};
		safetyGuard = new SafetyGuard(context);
	});

	describe("validatePath", () => {
		it("should allow paths within allowed directories", async () => {
			const validPath = await safetyGuard.validatePath("./src/file.txt");
			expect(validPath).toBe("/home/user/project/src/file.txt");
		});

		it("should allow current directory paths", async () => {
			const validPath = await safetyGuard.validatePath("./file.txt");
			expect(validPath).toBe("/home/user/project/file.txt");
		});

		it("should reject paths outside allowed directories", async () => {
			await expect(safetyGuard.validatePath("/etc/passwd")).rejects.toThrow(SafetyError);
		});

		it("should reject paths trying to escape with ..", async () => {
			await expect(safetyGuard.validatePath("../../etc/passwd")).rejects.toThrow(SafetyError);
		});

		it("should normalize paths with .. segments correctly", async () => {
			const validPath = await safetyGuard.validatePath("./src/../src/file.txt");
			expect(validPath).toBe("/home/user/project/src/file.txt");
		});

		it("should handle absolute paths within allowed directories", async () => {
			const validPath = await safetyGuard.validatePath("/home/user/project/src/file.txt");
			expect(validPath).toBe("/home/user/project/src/file.txt");
		});

		it("should reject absolute paths outside allowed directories", async () => {
			await expect(safetyGuard.validatePath("/home/other/file.txt")).rejects.toThrow(SafetyError);
		});

		it("should include allowed directories in error message", async () => {
			try {
				await safetyGuard.validatePath("/etc/passwd");
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error instanceof SafetyError).toBe(true);
				if (error instanceof SafetyError) {
					expect(error.message).toContain("., ./src");
				}
			}
		});
	});

	describe("requestConfirmation", () => {
		it("should skip confirmation when requireConfirmation is false", async () => {
			await expect(safetyGuard.requestConfirmation("Delete file?")).resolves.toBeUndefined();
		});

		it("should request confirmation when required", async () => {
			context.requireConfirmation = true;
			const mockHandler: ConfirmationHandler = {
				confirm: vi.fn().mockResolvedValue(true),
			};
			safetyGuard = new SafetyGuard(context, mockHandler);

			await safetyGuard.requestConfirmation("Delete file?");
			expect(mockHandler.confirm).toHaveBeenCalledWith("Delete file?");
		});

		it("should throw on user rejection", async () => {
			context.requireConfirmation = true;
			const mockHandler: ConfirmationHandler = {
				confirm: vi.fn().mockResolvedValue(false),
			};
			safetyGuard = new SafetyGuard(context, mockHandler);

			await expect(safetyGuard.requestConfirmation("Delete file?")).rejects.toThrow(SafetyError);

			await expect(safetyGuard.requestConfirmation("Delete file?")).rejects.toThrow(
				"Operation cancelled by user",
			);
		});

		it("should throw when confirmation required but no handler provided", async () => {
			context.requireConfirmation = true;
			safetyGuard = new SafetyGuard(context);

			await expect(safetyGuard.requestConfirmation("Delete file?")).rejects.toThrow(SafetyError);

			await expect(safetyGuard.requestConfirmation("Delete file?")).rejects.toThrow(
				"Confirmation required but no handler provided",
			);
		});
	});

	describe("fileExists", () => {
		it("should return true for existing files", async () => {
			// Test with a file we know exists (this test file itself)
			const exists = await safetyGuard.fileExists(__filename);
			expect(exists).toBe(true);
		});

		it("should return false for non-existing files", async () => {
			const exists = await safetyGuard.fileExists("/nonexistent/file.txt");
			expect(exists).toBe(false);
		});
	});
});
