import { parseArgs } from "node:util";

export interface Config {
  host: string;
  port: number;
  model: string;
}

export function loadConfig(): Config {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      host: { type: "string" },
      port: { type: "string" },
      model: { type: "string", short: "m" },
    },
    strict: false,
  });

  return {
    host:
      (values.host as string | undefined) ??
      process.env.GRET_OLLAMA_HOST ??
      "localhost",
    port: parseInt(
      (values.port as string | undefined) ??
        process.env.GRET_OLLAMA_PORT ??
        "11434",
      10
    ),
    model:
      (values.model as string | undefined) ??
      process.env.GRET_MODEL ??
      "mistral",
  };
}
