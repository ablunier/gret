import type { Message } from "@ablunier/apertus-core";
import { Box, Text } from "ink";
import React from "react";

export interface ChatDisplayProps {
	messages: Message[];
	maxHeight?: number;
}

function MessageView({ message }: { message: Message }): React.ReactElement | null {
	switch (message.role) {
		case "user":
			return (
				<Box flexDirection="column" marginBottom={1}>
					<Text color="cyan" bold>
						You:
					</Text>
					<Box marginLeft={2}>
						<Text>{message.content}</Text>
					</Box>
				</Box>
			);

		case "assistant":
			return (
				<Box flexDirection="column" marginBottom={1}>
					<Text color="magenta" bold>
						🤖 Apertus:
					</Text>
					<Box marginLeft={2}>
						{message.content && <Text>{message.content}</Text>}
						{message.toolCalls && message.toolCalls.length > 0 && (
							<Box flexDirection="column" marginTop={1}>
								{message.toolCalls.map((toolCall) => (
									<Box key={toolCall.id} flexDirection="row">
										<Text color="yellow">🔧 </Text>
										<Text color="yellow">{toolCall.function.name}</Text>
										<Text dimColor> - </Text>
										<Text dimColor>{formatToolArgs(toolCall.function.arguments)}</Text>
									</Box>
								))}
							</Box>
						)}
					</Box>
				</Box>
			);

		case "system":
			return (
				<Box flexDirection="column" marginBottom={1}>
					<Text color="gray" italic>
						System: {message.content}
					</Text>
				</Box>
			);

		case "tool":
			// Tool messages are displayed inline with tool execution, skip here
			return null;

		default:
			return null;
	}
}

function formatToolArgs(argsJson: string): string {
	try {
		const params = JSON.parse(argsJson) as Record<string, unknown>;
		const entries = Object.entries(params);
		if (entries.length === 0) {
			return "(no params)";
		}

		return entries
			.map(([key, value]) => {
				const strValue = typeof value === "string" ? truncate(value, 50) : JSON.stringify(value);

				return `${key}: ${strValue}`;
			})
			.join(", ");
	} catch {
		return truncate(argsJson, 80);
	}
}

function truncate(str: string, maxLength: number): string {
	if (str.length <= maxLength) {
		return str;
	}

	return `${str.slice(0, maxLength - 3)}...`;
}

export function ChatDisplay({ messages }: ChatDisplayProps): React.ReactElement {
	// Filter out tool messages as they're shown differently
	const displayMessages = messages.filter((m) => m.role !== "tool");

	if (displayMessages.length === 0) {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text dimColor>No messages yet. Start typing to begin a conversation.</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			{displayMessages.map((message, index) => (
				<MessageView key={index} message={message} />
			))}
		</Box>
	);
}
