import * as fs from "fs/promises";
import * as path from "path";

import { SafetyError } from "../../errors/ToolError.js";
import type { ExecutionContext } from "../../types/index.js";

export interface ConfirmationHandler {
	confirm(message: string): Promise<boolean>;
}

/**
 * Safety guard for tool execution
 */
export class SafetyGuard {
	constructor(
		private readonly context: ExecutionContext,
		private readonly confirmationHandler?: ConfirmationHandler,
	) {}

	/**
	 * Validate a file path is within allowed directories
	 */
	async validatePath(targetPath: string): Promise<string> {
		// Resolve to absolute path
		const absolutePath = path.isAbsolute(targetPath)
			? path.resolve(targetPath)
			: path.resolve(this.context.workingDirectory, targetPath);

		// Normalize path (remove .. and .)
		const normalizedPath = path.normalize(absolutePath);

		// Check if path is within allowed directories
		const isAllowed = this.context.allowedDirectories.some((allowedDir) => {
			const absoluteAllowedDir = path.resolve(this.context.workingDirectory, allowedDir);

			return normalizedPath.startsWith(absoluteAllowedDir);
		});

		if (!isAllowed) {
			throw new SafetyError(
				"path_validation",
				`Path "${normalizedPath}" is outside allowed directories: ${this.context.allowedDirectories.join(", ")}`,
			);
		}

		return normalizedPath;
	}

	/**
	 * Request user confirmation for destructive operations
	 */
	async requestConfirmation(message: string): Promise<void> {
		if (!this.context.requireConfirmation) {
			return;
		}

		if (!this.confirmationHandler) {
			throw new SafetyError("confirmation", "Confirmation required but no handler provided");
		}

		const confirmed = await this.confirmationHandler.confirm(message);
		if (!confirmed) {
			throw new SafetyError("confirmation", "Operation cancelled by user");
		}
	}

	/**
	 * Check if a file exists
	 */
	async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);

			return true;
		} catch {
			return false;
		}
	}
}
