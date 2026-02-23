import { Box, Text, useApp, useInput } from "ink";
import React, { useCallback, useState } from "react";

import { useConfig } from "../hooks/useConfig.js";
import { useConversation } from "../hooks/useConversation.js";
import { useToolExecution } from "../hooks/useToolExecution.js";
import { ChatDisplay } from "./ChatDisplay.js";
import { ConfirmationPrompt } from "./ConfirmationPrompt.js";
import { ErrorDisplay } from "./ErrorDisplay.js";
import { InputPrompt } from "./InputPrompt.js";
import { StatusBar } from "./StatusBar.js";
import { ToolExecutionView } from "./ToolExecutionView.js";

export interface AppProps {
	initialMessage?: string;
}

export function App({ initialMessage }: AppProps): React.ReactElement {
	const { exit } = useApp();
	const { config, providerConfig, isConfigured } = useConfig();
	const toolExecution = useToolExecution();
	const [inputHistory, setInputHistory] = useState<string[]>([]);

	const conversation = useConversation({
		providerConfig,
		config,
		confirmationHandler: toolExecution.confirmationHandler,
		onToolExecution: toolExecution.onToolStart,
		onToolResult: toolExecution.onToolComplete,
	});

	const handleSubmit = useCallback(
		async (input: string) => {
			if (input.toLowerCase() === "/exit" || input.toLowerCase() === "/quit") {
				exit();

				return;
			}

			if (input.toLowerCase() === "/clear") {
				conversation.clearMessages();
				toolExecution.clearState();

				return;
			}

			if (input.toLowerCase() === "/help") {
				return;
			}

			setInputHistory((prev) => [...prev, input]);

			// Send message
			await conversation.sendMessage(input);
		},
		[conversation, toolExecution, exit],
	);

	// Handle keyboard shortcuts
	useInput((input, _key) => {
		// Ctrl+C to exit
		if (input === "\x03") {
			exit();
		}
	});

	// Handle initial message on mount
	React.useEffect(() => {
		if (initialMessage) {
			void handleSubmit(initialMessage);
		}
	}, []); // Only run once on mount

	// Not configured state
	if (!isConfigured) {
		return (
			<Box flexDirection="column" padding={1}>
				<Box marginBottom={1}>
					<Text color="cyan" bold>
						🤖 Apertus CLI v0.1.0
					</Text>
				</Box>
				<ErrorDisplay
					error="Apertus CLI is not configured"
					suggestion="Run: apertus init\nOr: apertus config set-key <your-api-key>"
				/>
			</Box>
		);
	}

	const { state } = conversation;
	const isInputDisabled = state.status === "thinking" || state.status === "tool_executing";
	const pendingConfirmation = toolExecution.state.pendingConfirmation;
	const hasPendingConfirmation = pendingConfirmation !== null;

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box marginBottom={1}>
				<Text color="cyan" bold>
					🤖 Apertus CLI v0.1.0
				</Text>
				<Text dimColor> - Type 'exit' to quit, 'help' for commands</Text>
			</Box>

			{/* Status Bar */}
			<StatusBar
				model={providerConfig.model ?? "apertus-1"}
				status={state.status}
				tokenUsage={state.tokenUsage}
				showTokenUsage={config.ui.showTokenUsage}
				activeTool={toolExecution.state.lastToolName}
			/>

			{/* Chat Display */}
			<Box flexDirection="column" flexGrow={1} marginY={1}>
				<ChatDisplay messages={state.messages} />
			</Box>

			{/* Tool Execution View */}
			{(toolExecution.state.executingTools.length > 0 ||
				toolExecution.state.completedResults.length > 0) && (
				<ToolExecutionView
					executingTools={toolExecution.state.executingTools}
					completedResults={toolExecution.state.completedResults}
				/>
			)}

			{/* Confirmation Prompt */}
			{pendingConfirmation && (
				<ConfirmationPrompt
					message={pendingConfirmation.message}
					onConfirm={toolExecution.confirmAction}
				/>
			)}

			{/* Error Display */}
			{state.error && <ErrorDisplay error={state.error} />}

			{/* Input Prompt */}
			{!hasPendingConfirmation && (
				<InputPrompt
					onSubmit={handleSubmit}
					disabled={isInputDisabled}
					placeholder={isInputDisabled ? "Processing..." : "Type your message..."}
					history={inputHistory}
				/>
			)}
		</Box>
	);
}
