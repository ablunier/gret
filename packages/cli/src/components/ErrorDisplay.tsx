import { Box, Text } from "ink";
import React from "react";

export interface ErrorDisplayProps {
	error: string;
	suggestion?: string;
	showDebug?: boolean;
	stack?: string;
}

export function ErrorDisplay({
	error,
	suggestion,
	showDebug = false,
	stack,
}: ErrorDisplayProps): React.ReactElement {
	return (
		<Box flexDirection="column" borderStyle="round" borderColor="red" paddingX={1} marginY={1}>
			<Box flexDirection="row">
				<Text color="red">❌ Error: </Text>
				<Text color="red">{error}</Text>
			</Box>

			{suggestion && (
				<Box marginTop={1}>
					<Text color="yellow">💡 </Text>
					<Text>{suggestion}</Text>
				</Box>
			)}

			{showDebug && stack && (
				<Box marginTop={1} flexDirection="column">
					<Text dimColor>Stack trace:</Text>
					<Box marginLeft={2}>
						<Text dimColor>{stack}</Text>
					</Box>
				</Box>
			)}
		</Box>
	);
}
