import { ConfigStore } from "@ablunier/apertus-core";
import chalk from "chalk";

/**
 * Handle config set-key command
 */
export async function handleSetKey(apiKey: string): Promise<void> {
	if (!apiKey || apiKey.trim().length === 0) {
		console.error(chalk.red("Error: API key is required"));
		process.exit(1);
	}

	const configStore = new ConfigStore();
	configStore.setApiKey(apiKey.trim());

	console.log(chalk.green("✓ API key updated"));
}

/**
 * Handle config set model command
 */
export async function handleSetModel(model: string): Promise<void> {
	if (!model || model.trim().length === 0) {
		console.error(chalk.red("Error: Model name is required"));
		process.exit(1);
	}

	const configStore = new ConfigStore();
	configStore.setModel(model.trim());

	console.log(chalk.green(`✓ Default model changed to ${model}`));
}

/**
 * Show current configuration
 */
export async function handleShowConfig(): Promise<void> {
	const configStore = new ConfigStore();
	const config = configStore.getConfig();
	const provider = configStore.getProvider();

	console.log(chalk.cyan("Current Configuration:"));
	console.log(chalk.gray("─────────────────────"));
	console.log(chalk.yellow("Config File:"), configStore.getConfigPath());
	console.log(chalk.yellow("Provider:"), config.defaultProvider);
	console.log(chalk.yellow("Model:"), provider.model);
	console.log(
		chalk.yellow("API Key:"),
		provider.apiKey ? `***${provider.apiKey.slice(-4)}` : chalk.red("(not set)"),
	);
	console.log(chalk.yellow("Max Tokens:"), provider.maxTokens);
	console.log(chalk.yellow("Temperature:"), provider.temperature);
}
