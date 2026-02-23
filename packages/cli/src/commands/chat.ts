import type {
	ConfirmationHandler,
	ExecutionContext,
	Message,
	ToolMessage,
} from "@ablunier/apertus-core";
import {
	ConfigStore,
	createToolRegistry,
	PublicAIProvider,
	ToolExecutor,
} from "@ablunier/apertus-core";
import chalk from "chalk";
import ora from "ora";
import * as readline from "readline";

/**
 * CLI implementation of confirmation handler
 * Prompts user for yes/no confirmation
 */
class CLIConfirmationHandler implements ConfirmationHandler {
	async confirm(message: string): Promise<boolean> {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		return new Promise((resolve) => {
			rl.question(chalk.yellow(`\n⚠️  ${message}\n\nContinue? (y/n): `), (answer) => {
				rl.close();
				resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
			});
		});
	}
}

/**
 * Handle chat with multi-turn tool execution (Phase 2)
 */
export async function handleChat(messageContent: string): Promise<void> {
	const configStore = new ConfigStore();

	// Check if configured
	if (!configStore.isConfigured()) {
		console.error(chalk.red("Error: Apertus CLI is not configured."));
		console.error(chalk.yellow("\nRun: apertus init"));
		console.error(chalk.yellow("Or: apertus config set-key <your-api-key>"));
		process.exit(1);
	}

	// Get provider config
	const providerConfig = configStore.getProvider();
	const config = configStore.getConfig();

	// Create provider
	const provider = new PublicAIProvider({
		apiKey: providerConfig.apiKey,
		model: providerConfig.model,
		maxTokens: providerConfig.maxTokens,
		temperature: providerConfig.temperature,
	});

	// Create tool system
	const confirmationHandler = new CLIConfirmationHandler();
	const toolRegistry = createToolRegistry(confirmationHandler);
	const context: ExecutionContext = {
		workingDirectory: process.cwd(),
		allowedDirectories: ["."],
		requireConfirmation: config.tools.requireConfirmation,
	};
	const toolExecutor = new ToolExecutor(toolRegistry, context);
	const tools = toolRegistry.getToolDefinitions();

	// Initialize conversation
	const messages: Message[] = [{ role: "user", content: messageContent }];

	let turnCount = 0;
	const maxTurns = 10;
	let spinner: ReturnType<typeof ora> | null = null;

	try {
		while (turnCount < maxTurns) {
			turnCount++;

			// Show loading spinner
			spinner = ora({
				text: turnCount === 1 ? "Thinking..." : "Processing...",
				color: "cyan",
			}).start();

			// Send to LLM with tools
			const response = await provider.sendMessage(messages, { tools });

			// Stop spinner
			spinner.stop();
			spinner = null;

			// Add assistant message to conversation
			messages.push(response.message);

			// Handle response based on finish reason
			if (response.finishReason === "tool_calls" && response.message.toolCalls) {
				console.log(chalk.blue(`\n🔧 Executing ${response.message.toolCalls.length} tool(s)...`));

				// Execute tools
				const toolResults = await toolExecutor.executeToolCalls(response.message.toolCalls);

				// Display tool results
				for (const result of toolResults) {
					const status = result.success ? chalk.green("✓") : chalk.red("✗");
					console.log(`${status} ${result.name}`);
					if (!result.success) {
						console.log(chalk.gray(`  Error: ${result.error}`));
					}
				}

				// Add tool results to conversation
				const toolMessages: ToolMessage[] = toolResults.map((result) => ({
					role: "tool",
					content: result.content,
					toolCallId: result.id,
				}));
				messages.push(...toolMessages);

				// Continue to next turn
				continue;
			} else if (response.finishReason === "stop") {
				// Display final response
				console.log(chalk.cyan("\n🤖 Apertus:"));
				console.log(response.message.content);

				// Show token usage if enabled
				if (config.ui.showTokenUsage) {
					console.log(
						chalk.gray(
							`\nTokens: ${response.usage.totalTokens} (${response.usage.promptTokens} prompt + ${response.usage.completionTokens} completion)`,
						),
					);
				}

				break;
			} else {
				// Handle length/error
				console.log(chalk.yellow(`\n⚠️  Conversation ended: ${response.finishReason}`));
				if (response.message.content) {
					console.log(response.message.content);
				}
				break;
			}
		}

		if (turnCount >= maxTurns) {
			console.log(chalk.yellow("\n⚠️  Maximum turns reached"));
		}
	} catch (error) {
		if (spinner) {
			spinner.stop();
		}
		console.error(
			chalk.red("\n❌ Error:"),
			error instanceof Error ? error.message : "Unknown error",
		);
		process.exit(1);
	}
}
