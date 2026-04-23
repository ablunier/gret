import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { Animator } from "./components/Animator.js";
import { ANIMATION_NAMES } from "../animations/animation-registry.js";

export function App() {
  const [animation, setAnimation] = useState("idle");
  const [animIndex, setAnimIndex] = useState(0);

  function playAnimation(name: string) {
    setAnimation(name);
  }

  function handleComplete() {
    setAnimation("idle");
  }

  useInput((input, key) => {
    if (key.rightArrow || input === "n") {
      const next = (animIndex + 1) % ANIMATION_NAMES.length;
      setAnimIndex(next);
      playAnimation(ANIMATION_NAMES[next]!);
    } else if (key.leftArrow || input === "p") {
      const prev = (animIndex - 1 + ANIMATION_NAMES.length) % ANIMATION_NAMES.length;
      setAnimIndex(prev);
      playAnimation(ANIMATION_NAMES[prev]!);
    } else if (input === "q") {
      process.exit(0);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Animator animation={animation} onComplete={handleComplete} />
      <Text> </Text>
      <Text dimColor>
        [{animation}] — n/→ next · p/← prev · q quit
      </Text>
    </Box>
  );
}
