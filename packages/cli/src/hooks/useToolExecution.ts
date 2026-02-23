import type { ConfirmationHandler, ToolCall, ToolResult } from "@ablunier/apertus-core";
import { useCallback, useState } from "react";

export interface ToolExecutionState {
	pendingConfirmation: {
		message: string;
		resolve: (confirmed: boolean) => void;
	} | null;
	executingTools: ToolCall[];
	completedResults: ToolResult[];
	lastToolName: string | null;
}

export interface UseToolExecutionReturn {
	state: ToolExecutionState;
	confirmationHandler: ConfirmationHandler;
	confirmAction: (confirmed: boolean) => void;
	onToolStart: (toolCall: ToolCall) => void;
	onToolComplete: (result: ToolResult) => void;
	clearState: () => void;
}

export function useToolExecution(): UseToolExecutionReturn {
	const [state, setState] = useState<ToolExecutionState>({
		pendingConfirmation: null,
		executingTools: [],
		completedResults: [],
		lastToolName: null,
	});

	const confirmAction = useCallback(
		(confirmed: boolean) => {
			if (state.pendingConfirmation) {
				state.pendingConfirmation.resolve(confirmed);
				setState((prev) => ({
					...prev,
					pendingConfirmation: null,
				}));
			}
		},
		[state.pendingConfirmation],
	);

	const confirmationHandler: ConfirmationHandler = {
		confirm: (message: string): Promise<boolean> => {
			return new Promise((resolve) => {
				setState((prev) => ({
					...prev,
					pendingConfirmation: { message, resolve },
				}));
			});
		},
	};

	const onToolStart = useCallback((toolCall: ToolCall) => {
		setState((prev) => ({
			...prev,
			executingTools: [...prev.executingTools, toolCall],
			lastToolName: toolCall.function.name,
		}));
	}, []);

	const onToolComplete = useCallback((result: ToolResult) => {
		setState((prev) => ({
			...prev,
			executingTools: prev.executingTools.filter((tc) => tc.id !== result.id),
			completedResults: [...prev.completedResults, result],
		}));
	}, []);

	const clearState = useCallback(() => {
		setState({
			pendingConfirmation: null,
			executingTools: [],
			completedResults: [],
			lastToolName: null,
		});
	}, []);

	return {
		state,
		confirmationHandler,
		confirmAction,
		onToolStart,
		onToolComplete,
		clearState,
	};
}
