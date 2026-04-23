import { useState, useEffect } from "react";
import { FRAMES } from "../../animations/frames.js";
import { ANIMATIONS } from "../../animations/animation-registry.js";

export function useAnimation(animationName: string, onComplete?: () => void): string {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    setFrameIndex(0);

    const frames = FRAMES[animationName] ?? FRAMES["idle"]!;
    const config = ANIMATIONS[animationName];

    if (!config || frames.length <= 1) return;

    let current = 0;
    let repeats = 0;
    const REPEAT_COUNT = 5;
    const interval = setInterval(() => {
      current++;
      if (current >= frames.length) {
        current = 0;
        setFrameIndex(0);
        if (!config.loop) {
          repeats++;
          if (repeats >= REPEAT_COUNT) {
            clearInterval(interval);
            onComplete?.();
          }
        }
      } else {
        setFrameIndex(current);
      }
    }, config.frameDurationMs);

    return () => clearInterval(interval);
  }, [animationName]);

  const frames = FRAMES[animationName] ?? FRAMES["idle"]!;
  return frames[Math.min(frameIndex, frames.length - 1)]!;
}
