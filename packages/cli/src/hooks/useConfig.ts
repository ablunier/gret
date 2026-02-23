import type { ApertusConfig, ProviderConfig } from "@ablunier/apertus-core";
import { ConfigStore } from "@ablunier/apertus-core";
import { useCallback, useMemo, useState } from "react";

export interface UseConfigReturn {
	config: ApertusConfig;
	providerConfig: ProviderConfig;
	isConfigured: boolean;
	updateApiKey: (apiKey: string) => void;
	updateModel: (model: string) => void;
	reload: () => void;
}

export function useConfig(): UseConfigReturn {
	const configStore = useMemo(() => new ConfigStore(), []);
	const [config, setConfig] = useState<ApertusConfig>(() => configStore.getConfig());

	const isConfigured = useMemo(() => configStore.isConfigured(), [configStore]);

	const providerConfig = useMemo(() => {
		return configStore.getProvider();
	}, [config, configStore]);

	const updateApiKey = useCallback(
		(apiKey: string) => {
			configStore.setApiKey(apiKey);
			setConfig(configStore.getConfig());
		},
		[configStore],
	);

	const updateModel = useCallback(
		(model: string) => {
			configStore.setModel(model);
			setConfig(configStore.getConfig());
		},
		[configStore],
	);

	const reload = useCallback(() => {
		setConfig(configStore.getConfig());
	}, [configStore]);

	return {
		config,
		providerConfig,
		isConfigured,
		updateApiKey,
		updateModel,
		reload,
	};
}
