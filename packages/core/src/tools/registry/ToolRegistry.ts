import type { Tool, ToolDefinition } from "../../types/index.js";

export class ToolRegistry {
	private readonly tools: Map<string, Tool> = new Map();

	register(tool: Tool): void {
		this.tools.set(tool.name, tool);
	}

	get(name: string): Tool | undefined {
		return this.tools.get(name);
	}

	getAll(): Tool[] {
		return Array.from(this.tools.values());
	}

	has(name: string): boolean {
		return this.tools.has(name);
	}

	getToolDefinitions(): ToolDefinition[] {
		return this.getAll().map((tool) => ({
			type: "function",
			function: {
				name: tool.name,
				description: tool.description,
				parameters: tool.parameters,
			},
		}));
	}

	clear(): void {
		this.tools.clear();
	}

	size(): number {
		return this.tools.size;
	}
}
