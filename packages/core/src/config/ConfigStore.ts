import Conf from "conf";

import type { ApertusConfig, ProviderConfig } from "../types/index.js";
import { ApertusConfigSchema } from "./schema.js";

const DEFAULT_CONFIG: ApertusConfig = {
	version: "1",
	defaultProvider: "publicai",
	providers: {
		publicai: {
			type: "publicai",
			apiKey: "",
			model: "swiss-ai/apertus-8b-instruct",
			maxTokens: 483,
			temperature: 0.7,
		},
	},
	tools: {
		requireConfirmation: true,
		allowedDirectories: ["."],
		commandWhitelist: ["ls", "cat", "grep", "find", "git"],
	},
	ui: {
		theme: "default",
		showTokenUsage: true,
	},
};

export class ConfigStore {
	private readonly store: Conf<ApertusConfig>;

	constructor() {
		this.store = new Conf<ApertusConfig>({
			projectName: "apertus",
			defaults: DEFAULT_CONFIG,
			schema: {
				version: { type: "string" },
				defaultProvider: { type: "string" },
				providers: { type: "object" },
				tools: { type: "object" },
				ui: { type: "object" },
			} as any, // Conf's schema type is less strict than Zod
		});
	}

	getConfig(): ApertusConfig {
		const config = this.store.store;

		return ApertusConfigSchema.parse(config);
	}

	getProvider(name?: string): ProviderConfig {
		const config = this.getConfig();
		const providerName = name ?? config.defaultProvider;
		const provider = config.providers[providerName] as ProviderConfig | undefined;

		if (!provider) {
			throw new Error(`Provider "${providerName}" not found in configuration`);
		}

		return provider;
	}

	setApiKey(apiKey: string, providerName?: string): void {
		const config = this.getConfig();
		const name = providerName ?? config.defaultProvider;

		if (!(config.providers[name] as ProviderConfig | undefined)) {
			throw new Error(`Provider "${name}" not found`);
		}

		this.store.set(`providers.${name}.apiKey`, apiKey);
	}

	setModel(model: string, providerName?: string): void {
		const config = this.getConfig();
		const name = providerName ?? config.defaultProvider;

		if (!(config.providers[name] as ProviderConfig | undefined)) {
			throw new Error(`Provider "${name}" not found`);
		}

		this.store.set(`providers.${name}.model`, model);
	}

	isConfigured(): boolean {
		try {
			const provider = this.getProvider();

			return provider.apiKey.length > 0;
		} catch {
			return false;
		}
	}

	getConfigPath(): string {
		return this.store.path;
	}

	reset(): void {
		this.store.clear();
	}
}
