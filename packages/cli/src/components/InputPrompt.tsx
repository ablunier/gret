import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import React, { useCallback, useState } from "react";

export interface InputPromptProps {
	onSubmit: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	history?: string[];
}

export function InputPrompt({
	onSubmit,
	disabled = false,
	placeholder = "Type your message...",
	history = [],
}: InputPromptProps): React.ReactElement {
	const [value, setValue] = useState("");
	const [historyIndex, setHistoryIndex] = useState(-1);

	const handleSubmit = useCallback(
		(input: string) => {
			const trimmed = input.trim();
			if (trimmed && !disabled) {
				onSubmit(trimmed);
				setValue("");
				setHistoryIndex(-1);
			}
		},
		[onSubmit, disabled],
	);

	useInput((input, key) => {
		if (disabled) {
			return;
		}

		// Handle history navigation
		if (key.upArrow && history.length > 0) {
			const newIndex = Math.min(historyIndex + 1, history.length - 1);
			setHistoryIndex(newIndex);
			setValue(history[history.length - 1 - newIndex] || "");
		}

		if (key.downArrow && historyIndex > -1) {
			const newIndex = historyIndex - 1;
			setHistoryIndex(newIndex);
			if (newIndex < 0) {
				setValue("");
			} else {
				setValue(history[history.length - 1 - newIndex] || "");
			}
		}

		// Handle Ctrl+C to clear input
		if (input === "\x03") {
			setValue("");
			setHistoryIndex(-1);
		}
	});

	return (
		<Box flexDirection="row" paddingY={1}>
			<Text color="cyan" bold>
				You:{" "}
			</Text>
			{disabled ? (
				<Text dimColor>{placeholder}</Text>
			) : (
				<TextInput
					value={value}
					onChange={setValue}
					onSubmit={handleSubmit}
					placeholder={placeholder}
				/>
			)}
		</Box>
	);
}
