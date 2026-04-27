import React from "react";
import { Box, Text } from "ink";

interface MessageDisplayProps {
  text: string;
}

export function MessageDisplay({ text }: MessageDisplayProps) {
  if (!text) return null;
  return (
    <Box marginTop={1}>
      <Text color="cyan" bold>Gret: </Text>
      <Text>{text}</Text>
    </Box>
  );
}
