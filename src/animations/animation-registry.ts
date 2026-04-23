export interface AnimationConfig {
  frameDurationMs: number;
  loop: boolean;
  description: string;
}

export const ANIMATIONS: Record<string, AnimationConfig> = {
  idle:     { frameDurationMs: 0,   loop: false, description: "Default resting pose" },
  thinking: { frameDurationMs: 300, loop: true,  description: "Waiting for response" },
  purr:     { frameDurationMs: 300, loop: false, description: "Happy and content" },
  stretch:  { frameDurationMs: 250, loop: false, description: "Lazy morning stretch" },
  pounce:   { frameDurationMs: 150, loop: false, description: "Excited and playful" },
  hiss:     { frameDurationMs: 200, loop: false, description: "Annoyed or territorial" },
  sleep:    { frameDurationMs: 500, loop: false, description: "Tired or bored" },
  curious:  { frameDurationMs: 250, loop: false, description: "Interested and asking" },
  loaf:     { frameDurationMs: 400, loop: false, description: "Neutral or thinking" },
  knock:    { frameDurationMs: 200, loop: false, description: "Mischievous" },
  groom:    { frameDurationMs: 300, loop: false, description: "Self-satisfied, dismissive of user" },
  zoomies:  { frameDurationMs: 100, loop: false, description: "Sudden burst of hyper energy" },
  blep:     { frameDurationMs: 350, loop: false, description: "Silly, tongue out playfully" },
  scared:   { frameDurationMs: 200, loop: false, description: "Startled or alarmed" },
  love:     { frameDurationMs: 300, loop: false, description: "Deeply affectionate, heart-eyes" },
};

export const ANIMATION_NAMES = Object.keys(ANIMATIONS);
