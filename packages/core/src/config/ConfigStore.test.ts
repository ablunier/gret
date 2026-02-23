import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ConfigStore } from "./ConfigStore.js";

describe("ConfigStore", () => {
	let configStore: ConfigStore;

	beforeEach(() => {
		configStore = new ConfigStore();
	});

	afterEach(() => {
		// Clean up test config
		configStore.reset();
	});

	it("should load default configuration", () => {
		const config = configStore.getConfig();
		expect(config.version).toBe("1");
		expect(config.defaultProvider).toBe("publicai");
		expect(config.providers.publicai).toBeDefined();
	});

	it("should set and get API key", () => {
		configStore.setApiKey("test-api-key-123");
		const provider = configStore.getProvider();
		expect(provider.apiKey).toBe("test-api-key-123");
	});

	it("should check if configured", () => {
		expect(configStore.isConfigured()).toBe(false);
		configStore.setApiKey("test-key");
		expect(configStore.isConfigured()).toBe(true);
	});

	it("should set model", () => {
		configStore.setModel("apertus-2");
		const provider = configStore.getProvider();
		expect(provider.model).toBe("apertus-2");
	});

	it("should get config path", () => {
		const path = configStore.getConfigPath();
		expect(path).toContain("apertus");
	});
});
