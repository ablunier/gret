import { beforeEach, describe, expect, it } from "vitest";

import type { ExecutionContext } from "../../types/index.js";
import { RunCommandTool } from "./RunCommandTool.js";

describe("RunCommandTool", () => {
	let tool: RunCommandTool;
	let context: ExecutionContext;

	beforeEach(() => {
		tool = new RunCommandTool();
		context = {
			workingDirectory: process.cwd(),
			allowedDirectories: ["."],
			requireConfirmation: false,
		};
	});

	it("should have correct metadata", () => {
		expect(tool.name).toBe("run_command");
		expect(tool.description).toBeTruthy();
		expect(tool.parameters.required).toContain("command");
	});

	it("should return not implemented error", async () => {
		const result = await tool.execute({ command: 'echo "test"' }, context);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Not implemented");
		expect(result.content).toContain("not yet implemented");
		expect(result.content).toContain("Phase 3");
	});

	it("should accept optional workingDirectory parameter", async () => {
		const result = await tool.execute({ command: "ls", workingDirectory: "/tmp" }, context);

		// Should still return not implemented
		expect(result.success).toBe(false);
		expect(result.error).toBe("Not implemented");
	});
});
