export interface OllamaConfig {
  host: string;
  port: number;
  model: string;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OllamaError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "OllamaError";
  }
}

export async function chat(
  config: OllamaConfig,
  messages: Message[]
): Promise<string> {
  const url = `http://${config.host}:${config.port}/api/chat`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        messages,
        format: "json",
        stream: false,
      }),
    });
  } catch {
    throw new OllamaConnectionError(config);
  }

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 404 && body.includes("model")) {
      throw new OllamaModelNotFoundError(config.model);
    }
    throw new OllamaError(response.status, body);
  }

  const data = (await response.json()) as { message: { content: string } };
  return data.message.content;
}

export class OllamaConnectionError extends OllamaError {
  constructor(config: OllamaConfig) {
    super(
      0,
      `Cannot connect to Ollama at ${config.host}:${config.port}`
    );
    this.name = "OllamaConnectionError";
  }
}

export class OllamaModelNotFoundError extends OllamaError {
  constructor(public readonly model: string) {
    super(404, `Model '${model}' not found`);
    this.name = "OllamaModelNotFoundError";
  }
}
