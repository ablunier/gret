import type { ToolCall, ToolResult } from "@ablunier/apertus-core";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React from "react";

export interface ToolExecutionViewProps {
	executingTools: ToolCall[];
	completedResults: ToolResult[];
	showDetails?: boolean;
}

function ToolCallView({
	toolCall,
	isExecuting,
}: {
	toolCall: ToolCall;
	isExecuting: boolean;
}): React.ReactElement {
	const params = parseToolArgs(toolCall.function.arguments);

	return (
		<Box flexDirection="column" marginLeft={2}>
			<Box flexDirection="row">
				{isExecuting ? (
					<Text color="yellow">
						<Spinner type="dots" />
					</Text>
				) : (
					<Text color="yellow">🔧</Text>
				)}
				<Text color="yellow" bold>
					{" "}
					{toolCall.function.name}
				</Text>
			</Box>
			<Box marginLeft={3}>
				{Object.entries(params).map(([key, value]) => (
					<Box key={key} flexDirection="row">
						<Text dimColor>{key}: </Text>
						<Text color="gray">{formatValue(value)}</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function parseToolArgs(argsJson: string): Record<string, unknown> {
	try {
		return JSON.parse(argsJson) as Record<string, unknown>;
	} catch {
		return {};
	}
}

function ToolResultView({ result }: { result: ToolResult }): React.ReactElement {
	return (
		<Box flexDirection="column" marginLeft={2}>
			<Box flexDirection="row">
				{result.success ? <Text color="green">✓</Text> : <Text color="red">✗</Text>}
				<Text bold> {result.name}</Text>
			</Box>
			{!result.success && result.error && (
				<Box marginLeft={3}>
					<Text color="red">{result.error}</Text>
				</Box>
			)}
			{result.success && result.content && (
				<Box marginLeft={3}>
					<Text dimColor>{truncateContent(result.content, 200)}</Text>
				</Box>
			)}
		</Box>
	);
}

function formatValue(value: unknown): string {
	if (typeof value === "string") {
		return truncateContent(value, 80);
	}

	return JSON.stringify(value);
}

function truncateContent(content: string, maxLength: number): string {
	// Remove newlines for display
	const singleLine = content.replace(/\n/g, " ").replace(/\s+/g, " ");
	if (singleLine.length <= maxLength) {
		return singleLine;
	}

	return `${singleLine.slice(0, maxLength - 3)}...`;
}

export function ToolExecutionView({
	executingTools,
	completedResults,
	showDetails = true,
}: ToolExecutionViewProps): React.ReactElement | null {
	if (executingTools.length === 0 && completedResults.length === 0) {
		return null;
	}

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={1} marginY={1}>
			<Text color="yellow" bold>
				Tool Execution
			</Text>

			{executingTools.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					{executingTools.map((toolCall) => (
						<ToolCallView key={toolCall.id} toolCall={toolCall} isExecuting={true} />
					))}
				</Box>
			)}

			{showDetails && completedResults.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					{completedResults.map((result) => (
						<ToolResultView key={result.id} result={result} />
					))}
				</Box>
			)}
		</Box>
	);
}
