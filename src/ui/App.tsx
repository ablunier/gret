import React, { useState, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Animator } from "./components/Animator.js";
import { MessageDisplay } from "./components/MessageDisplay.js";
import { InputPrompt } from "./components/InputPrompt.js";
import {
  chat,
  OllamaConnectionError,
  OllamaModelNotFoundError,
} from "../llm/ollama-client.js";
import type { Message } from "../llm/ollama-client.js";
import { parseResponse } from "../llm/response-parser.js";
import { buildSystemPrompt } from "../llm/system-prompt.js";
import type { Config } from "../config/config.js";

interface AppProps {
  config: Config;
}

export function App({ config }: AppProps) {
  const { exit } = useApp();
  const [animation, setAnimation] = useState("idle");
  const [message, setMessage] = useState("Gret is watching you...");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Message[]>([
    { role: "system", content: buildSystemPrompt() },
  ]);

  useInput((_input, key) => {
    if (key.ctrl && _input === "c") {
      exit();
    }
  });

  function handleComplete() {
    setAnimation("idle");
  }

  const handleInput = useCallback(
    async (input: string) => {
      if (input === "exit" || input === "quit") {
        exit();
        return;
      }

      setError(null);
      setIsThinking(true);
      setAnimation("thinking");
      setMessage("");

      const newHistory: Message[] = [
        ...history,
        { role: "user", content: input },
      ];

      try {
        const raw = await chat(config, newHistory);
        const response = parseResponse(raw);

        setHistory([...newHistory, { role: "assistant", content: raw }]);
        setIsThinking(false);
        setAnimation(response.animation);
        setMessage(response.text);
      } catch (err) {
        setIsThinking(false);
        setAnimation("scared");

        if (err instanceof OllamaModelNotFoundError) {
          setError(
            `🐱 The model '${err.model}' isn't installed.\n\nTo install it:\n  ollama pull ${err.model}\n\nOr use a different model:\n  gret --model llama2`
          );
        } else if (err instanceof OllamaConnectionError) {
          setError(
            `🐱 Gret can't reach Ollama!\n\nMake sure Ollama is running:\n  ollama serve\n\nOr configure a different host:\n  gret --host <host> --port <port>\n\nInstall Ollama: https://ollama.ai`
          );
        } else {
          setError(`Error: ${String(err)}`);
        }
      }
    },
    [history, config, exit]
  );

  return (
    <Box flexDirection="column" padding={1}>
      <Animator animation={animation} onComplete={handleComplete} />
      {error ? (
        <Box marginTop={1} flexDirection="column">
          <Text color="red">{error}</Text>
        </Box>
      ) : (
        <MessageDisplay text={message} />
      )}
      <InputPrompt onSubmit={handleInput} disabled={isThinking} />
      <Box marginTop={1}>
        <Text dimColor>model: {config.model} · exit/quit or Ctrl+C to leave</Text>
      </Box>
    </Box>
  );
}
