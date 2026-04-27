import { ANIMATIONS } from "../animations/animation-registry.js";

export interface CatResponse {
  animation: string;
  text: string;
}

export function parseResponse(raw: string): CatResponse {
  try {
    const parsed = JSON.parse(raw);
    const animation =
      typeof parsed.animation === "string" && parsed.animation in ANIMATIONS
        ? parsed.animation
        : "loaf";
    const text = typeof parsed.text === "string" ? parsed.text : raw;
    return { animation, text };
  } catch {
    return { animation: "loaf", text: raw };
  }
}
