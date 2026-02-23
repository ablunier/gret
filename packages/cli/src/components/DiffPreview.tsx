import { Box, Text } from "ink";
import React from "react";

export interface DiffLine {
	type: "add" | "remove" | "context";
	content: string;
	lineNumber?: number;
}

export interface DiffPreviewProps {
	filePath: string;
	diff: DiffLine[];
	maxLines?: number;
}

function DiffLineView({ line }: { line: DiffLine }): React.ReactElement {
	const prefix = line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
	const color = line.type === "add" ? "green" : line.type === "remove" ? "red" : undefined;

	return (
		<Box flexDirection="row">
			<Text color={color}>
				{prefix} {line.content}
			</Text>
		</Box>
	);
}

export function DiffPreview({
	filePath,
	diff,
	maxLines = 20,
}: DiffPreviewProps): React.ReactElement {
	const displayDiff = diff.slice(0, maxLines);
	const hasMore = diff.length > maxLines;

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="blue" paddingX={1} marginY={1}>
			<Box flexDirection="row" marginBottom={1}>
				<Text color="blue">📝 Preview changes: </Text>
				<Text color="white" bold>
					{filePath}
				</Text>
			</Box>

			<Box flexDirection="column" marginLeft={1}>
				{displayDiff.map((line, index) => (
					<DiffLineView key={index} line={line} />
				))}
			</Box>

			{hasMore && (
				<Box marginTop={1}>
					<Text dimColor>... {diff.length - maxLines} more lines</Text>
				</Box>
			)}
		</Box>
	);
}

/**
 * Generate a simple diff between two strings
 */
export function generateSimpleDiff(oldContent: string, newContent: string): DiffLine[] {
	const oldLines = oldContent.split("\n");
	const newLines = newContent.split("\n");
	const diff: DiffLine[] = [];

	// Simple line-by-line comparison
	const maxLines = Math.max(oldLines.length, newLines.length);

	for (let i = 0; i < maxLines; i++) {
		const oldLine = oldLines[i] as string | undefined;
		const newLine = newLines[i] as string | undefined;

		if (oldLine === newLine) {
			if (oldLine !== undefined) {
				diff.push({ type: "context", content: oldLine });
			}
		} else {
			if (oldLine !== undefined) {
				diff.push({ type: "remove", content: oldLine });
			}
			if (newLine !== undefined) {
				diff.push({ type: "add", content: newLine });
			}
		}
	}

	return diff;
}
