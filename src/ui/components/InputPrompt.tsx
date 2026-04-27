import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

interface InputPromptProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function InputPrompt({ onSubmit, disabled = false }: InputPromptProps) {
  const [value, setValue] = useState("");

  useInput((input, key) => {
    if (disabled) return;

    if (key.return) {
      const trimmed = value.trim();
      if (trimmed) {
        onSubmit(trimmed);
        setValue("");
      }
      return;
    }

    if (key.backspace || key.delete) {
      setValue((prev) => prev.slice(0, -1));
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      setValue((prev) => prev + input);
    }
  });

  return (
    <Box marginTop={1}>
      <Text color={disabled ? "gray" : "green"}>&gt; </Text>
      <Text>{value}</Text>
      {!disabled && <Text color="gray">█</Text>}
    </Box>
  );
}
