import { ListDirectoryTool } from "../implementations/ListDirectoryTool.js";
import { ReadFileTool } from "../implementations/ReadFileTool.js";
import { RunCommandTool } from "../implementations/RunCommandTool.js";
import { SearchFilesTool } from "../implementations/SearchFilesTool.js";
import { WriteFileTool } from "../implementations/WriteFileTool.js";
import { ToolRegistry } from "../registry/ToolRegistry.js";
import type { ConfirmationHandler } from "../safety/SafetyGuard.js";

/**
 * Create a tool registry with all standard tools registered
 * @param confirmationHandler Optional handler for user confirmations (required for destructive operations)
 * @returns Configured ToolRegistry instance
 */
export function createToolRegistry(confirmationHandler?: ConfirmationHandler): ToolRegistry {
	const registry = new ToolRegistry();

	// Register all standard tools
	registry.register(new ReadFileTool());
	registry.register(new WriteFileTool(confirmationHandler));
	registry.register(new ListDirectoryTool());
	registry.register(new SearchFilesTool());
	registry.register(new RunCommandTool());

	return registry;
}
