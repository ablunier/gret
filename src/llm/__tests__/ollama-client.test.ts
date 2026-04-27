import { test, expect, describe, mock, beforeEach, afterEach } from "bun:test";
import {
  OllamaError,
  OllamaConnectionError,
  OllamaModelNotFoundError,
  chat,
} from "../ollama-client.js";
import type { OllamaConfig } from "../ollama-client.js";

const config: OllamaConfig = { host: "localhost", port: 11434, model: "mistral" };

describe("OllamaError classes", () => {
  test("OllamaError stores status", () => {
    const err = new OllamaError(500, "internal error");
    expect(err.status).toBe(500);
    expect(err.message).toBe("internal error");
    expect(err.name).toBe("OllamaError");
  });

  test("OllamaConnectionError is an OllamaError", () => {
    const err = new OllamaConnectionError(config);
    expect(err instanceof OllamaError).toBe(true);
    expect(err.name).toBe("OllamaConnectionError");
    expect(err.message).toContain("localhost:11434");
  });

  test("OllamaModelNotFoundError stores model name", () => {
    const err = new OllamaModelNotFoundError("mistral");
    expect(err instanceof OllamaError).toBe(true);
    expect(err.model).toBe("mistral");
    expect(err.status).toBe(404);
    expect(err.name).toBe("OllamaModelNotFoundError");
  });
});

describe("chat()", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("returns message content on success", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ message: { content: '{"animation":"purr","text":"meow"}' } }),
          { status: 200 }
        )
      )
    ) as typeof fetch;

    const result = await chat(config, [{ role: "user", content: "hello" }]);
    expect(result).toBe('{"animation":"purr","text":"meow"}');
  });

  test("throws OllamaConnectionError when fetch fails", async () => {
    globalThis.fetch = mock(() => Promise.reject(new TypeError("fetch failed"))) as typeof fetch;

    await expect(
      chat(config, [{ role: "user", content: "hi" }])
    ).rejects.toBeInstanceOf(OllamaConnectionError);
  });

  test("throws OllamaModelNotFoundError on 404 with model in body", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("model not found", { status: 404 }))
    ) as typeof fetch;

    await expect(
      chat(config, [{ role: "user", content: "hi" }])
    ).rejects.toBeInstanceOf(OllamaModelNotFoundError);
  });

  test("throws OllamaError on non-200 non-404 status", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("bad gateway", { status: 502 }))
    ) as typeof fetch;

    await expect(
      chat(config, [{ role: "user", content: "hi" }])
    ).rejects.toBeInstanceOf(OllamaError);
  });

  test("sends correct request body", async () => {
    let capturedBody: unknown;
    globalThis.fetch = mock((url: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return Promise.resolve(
        new Response(
          JSON.stringify({ message: { content: "{}" } }),
          { status: 200 }
        )
      );
    }) as typeof fetch;

    const messages = [{ role: "user" as const, content: "test" }];
    await chat(config, messages);

    expect(capturedBody).toMatchObject({
      model: "mistral",
      messages,
      format: "json",
      stream: false,
    });
  });
});
