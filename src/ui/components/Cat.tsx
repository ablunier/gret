import React from "react";
import { Text } from "ink";

interface CatProps {
  frame: string;
}

export function Cat({ frame }: CatProps) {
  return <Text>{frame}</Text>;
}
