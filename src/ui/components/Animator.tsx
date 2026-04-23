import React from "react";
import { Cat } from "./Cat.js";
import { useAnimation } from "../hooks/useAnimation.js";

interface AnimatorProps {
  animation: string;
  onComplete?: () => void;
}

export function Animator({ animation, onComplete }: AnimatorProps) {
  const frame = useAnimation(animation, onComplete);
  return <Cat frame={frame} />;
}
