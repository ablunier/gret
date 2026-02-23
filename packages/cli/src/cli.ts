#!/usr/bin/env node

import { Command } from "commander";

import { handleChat } from "./commands/chat.js";
import { handleSetKey, handleSetModel, handleShowConfig } from "./commands/config-cmd.js";
import { handleInit } from "./commands/init.js";
import { handleInteractive } from "./commands/interactive.js";

const program = new Command();

program
	.name("apertus")
	.description("Terminal-based AI coding agent powered by Apertus LLM")
	.version("0.1.0");

// Default action - interactive mode or single message
program
	.argument("[message]", "Message to send to the LLM (starts interactive mode if omitted)")
	.option("--no-ui", "Use simple console output instead of interactive UI")
	.action(async (message?: string, options?: { ui?: boolean }) => {
		const useInteractiveUI = options?.ui !== false;

		if (message) {
			if (useInteractiveUI) {
				// Single message with interactive UI
				await handleInteractive({ initialMessage: message });
			} else {
				// Single message with simple console output (legacy mode)
				await handleChat(message);
			}
		} else {
			// No message provided, start interactive mode
			await handleInteractive();
		}
	});

// Init command
program.command("init").description("Initialize Apertus CLI configuration").action(handleInit);

// Config commands
const configCmd = program.command("config").description("Manage configuration");

configCmd.command("set-key <api-key>").description("Set API key").action(handleSetKey);

configCmd.command("set-model <model>").description("Set default model").action(handleSetModel);

configCmd.command("show").description("Show current configuration").action(handleShowConfig);

// Parse arguments
program.parse();
