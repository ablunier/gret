import { Box, Text, useInput } from "ink";
import React from "react";

export interface ConfirmationPromptProps {
	message: string;
	onConfirm: (confirmed: boolean) => void;
}

export function ConfirmationPrompt({
	message,
	onConfirm,
}: ConfirmationPromptProps): React.ReactElement {
	useInput((input) => {
		const lower = input.toLowerCase();
		if (lower === "y") {
			onConfirm(true);
		} else if (lower === "n") {
			onConfirm(false);
		}
	});

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={1} marginY={1}>
			<Box flexDirection="row">
				<Text color="yellow">⚠️ </Text>
				<Text>{message}</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>Continue? (</Text>
				<Text color="green" bold>
					y
				</Text>
				<Text dimColor>/</Text>
				<Text color="red" bold>
					n
				</Text>
				<Text dimColor>): </Text>
			</Box>
		</Box>
	);
}
