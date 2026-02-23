import type { TokenUsage } from "@ablunier/apertus-core";
import { Box, Text } from "ink";
import React from "react";

import type { ConversationStatus } from "../hooks/useConversation.js";

export interface StatusBarProps {
	model: string;
	status: ConversationStatus;
	tokenUsage: TokenUsage | null;
	showTokenUsage?: boolean;
	activeTool?: string | null;
}

export function StatusBar({
	model,
	status,
	tokenUsage,
	showTokenUsage = true,
	activeTool,
}: StatusBarProps): React.ReactElement {
	const getStatusIndicator = () => {
		switch (status) {
			case "idle":
				return <Text color="green">● Ready</Text>;
			case "thinking":
				return <Text color="cyan">💭 Thinking...</Text>;
			case "tool_executing":
				return (
					<Text color="yellow">
						🔧 {activeTool ? `Executing ${activeTool}` : "Executing tool..."}
					</Text>
				);
			case "error":
				return <Text color="red">❌ Error</Text>;
		}
	};

	return (
		<Box
			borderStyle="single"
			borderColor="gray"
			paddingX={1}
			flexDirection="row"
			justifyContent="space-between"
		>
			<Box>
				<Text color="blue">🤖 </Text>
				<Text dimColor>Model: </Text>
				<Text color="white">{model}</Text>
			</Box>

			<Box marginLeft={2}>{getStatusIndicator()}</Box>

			{showTokenUsage && tokenUsage && (
				<Box marginLeft={2}>
					<Text dimColor>Tokens: </Text>
					<Text color="gray">
						{tokenUsage.totalTokens} ({tokenUsage.promptTokens}+{tokenUsage.completionTokens})
					</Text>
				</Box>
			)}
		</Box>
	);
}
