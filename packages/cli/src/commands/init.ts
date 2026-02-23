import { ConfigStore } from "@ablunier/apertus-core";
import chalk from "chalk";
import { createInterface } from "readline/promises";

/**
 * Initialize configuration interactively
 */
export async function handleInit(): Promise<void> {
	console.log(chalk.cyan("🤖 Apertus CLI Setup\n"));

	const configStore = new ConfigStore();
	const readline = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	try {
		// Get API key
		const apiKey = await readline.question(chalk.yellow("API Key (from platform.publicai.co): "));

		if (!apiKey || apiKey.trim().length === 0) {
			console.error(chalk.red("\nError: API key is required"));
			process.exit(1);
		}

		// Get model (optional, with default)
		const model = await readline.question(
			chalk.yellow("Default Model [swiss-ai/apertus-8b-instruct]: "),
		);

		// Save configuration
		configStore.setApiKey(apiKey.trim());
		if (model && model.trim().length > 0) {
			configStore.setModel(model.trim());
		}

		console.log(chalk.green("\n✓ Configuration saved to:"), configStore.getConfigPath());
		console.log(chalk.green("✓ Ready to use!\n"));
		console.log(chalk.cyan("Run 'apertus \"Hello\"' to start chatting."));
	} catch (error) {
		console.error(
			chalk.red("\nSetup failed:"),
			error instanceof Error ? error.message : "Unknown error",
		);
		process.exit(1);
	} finally {
		readline.close();
	}
}
