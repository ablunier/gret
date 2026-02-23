import { render } from "ink";
import React from "react";

import { App } from "../components/App.js";

export interface InteractiveOptions {
	initialMessage?: string;
}

export async function handleInteractive(options: InteractiveOptions = {}): Promise<void> {
	const { waitUntilExit } = render(<App initialMessage={options.initialMessage} />);

	await waitUntilExit();
}
