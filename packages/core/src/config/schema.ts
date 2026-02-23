import { z } from "zod";

export const ProviderConfigSchema: z.ZodObject<{
	type: z.ZodEnum<["publicai", "custom"]>;
	apiKey: z.ZodString;
	baseUrl: z.ZodOptional<z.ZodString>;
	model: z.ZodOptional<z.ZodString>;
	maxTokens: z.ZodOptional<z.ZodNumber>;
	temperature: z.ZodOptional<z.ZodNumber>;
}> = z.object({
	type: z.enum(["publicai", "custom"]),
	apiKey: z.string(),
	baseUrl: z.string().url().optional(),
	model: z.string().optional(),
	maxTokens: z.number().positive().optional(),
	temperature: z.number().min(0).max(2).optional(),
});

export const ToolConfigSchema: z.ZodObject<{
	requireConfirmation: z.ZodBoolean;
	allowedDirectories: z.ZodArray<z.ZodString>;
	commandWhitelist: z.ZodArray<z.ZodString>;
}> = z.object({
	requireConfirmation: z.boolean(),
	allowedDirectories: z.array(z.string()),
	commandWhitelist: z.array(z.string()),
});

export const UIConfigSchema: z.ZodObject<{
	theme: z.ZodEnum<["default", "minimal"]>;
	showTokenUsage: z.ZodBoolean;
}> = z.object({
	theme: z.enum(["default", "minimal"]),
	showTokenUsage: z.boolean(),
});

export const ApertusConfigSchema: z.ZodObject<{
	version: z.ZodString;
	defaultProvider: z.ZodString;
	providers: z.ZodRecord<z.ZodString, typeof ProviderConfigSchema>;
	tools: typeof ToolConfigSchema;
	ui: typeof UIConfigSchema;
}> = z.object({
	version: z.string(),
	defaultProvider: z.string(),
	providers: z.record(z.string(), ProviderConfigSchema),
	tools: ToolConfigSchema,
	ui: UIConfigSchema,
});

export type ApertusConfigInput = z.input<typeof ApertusConfigSchema>;
export type ApertusConfigOutput = z.output<typeof ApertusConfigSchema>;
