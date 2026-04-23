import { test, expect, describe } from "bun:test";
import { FRAMES } from "../../../animations/frames";
import { ANIMATIONS, ANIMATION_NAMES } from "../../../animations/animation-registry";

// Pure frame advancement logic — mirrors useAnimation's interval callback
function advanceFrame(
  current: number,
  totalFrames: number,
  loop: boolean
): { next: number; completed: boolean } {
  const next = current + 1;
  if (next >= totalFrames) {
    if (loop) return { next: 0, completed: false };
    return { next: current, completed: true };
  }
  return { next, completed: false };
}

describe("advanceFrame", () => {
  test("advances to next frame", () => {
    expect(advanceFrame(0, 3, false)).toEqual({ next: 1, completed: false });
    expect(advanceFrame(1, 3, false)).toEqual({ next: 2, completed: false });
  });

  test("non-looping animation completes at last frame", () => {
    expect(advanceFrame(2, 3, false)).toEqual({ next: 2, completed: true });
  });

  test("looping animation wraps to frame 0 at end", () => {
    expect(advanceFrame(2, 3, true)).toEqual({ next: 0, completed: false });
  });

  test("single-frame animation completes immediately", () => {
    expect(advanceFrame(0, 1, false)).toEqual({ next: 0, completed: true });
  });
});

describe("animation frame cycling", () => {
  test("all animations cycle through all frames without completing prematurely", () => {
    for (const name of ANIMATION_NAMES) {
      if (name === "idle") continue; // idle is static

      const frames = FRAMES[name]!;
      const config = ANIMATIONS[name]!;
      let frame = 0;

      for (let step = 0; step < frames.length - 1; step++) {
        const result = advanceFrame(frame, frames.length, config.loop);
        expect(result.completed).toBe(false);
        frame = result.next;
      }
    }
  });

  test("non-looping animations complete after last frame", () => {
    for (const name of ANIMATION_NAMES) {
      const config = ANIMATIONS[name]!;
      if (config.loop) continue;

      const frames = FRAMES[name]!;
      const lastFrame = frames.length - 1;
      const result = advanceFrame(lastFrame, frames.length, false);
      expect(result.completed).toBe(true);
      expect(result.next).toBe(lastFrame); // stays on last frame
    }
  });

  test("thinking animation loops instead of completing", () => {
    const frames = FRAMES["thinking"]!;
    const lastFrame = frames.length - 1;
    const result = advanceFrame(lastFrame, frames.length, true);
    expect(result.completed).toBe(false);
    expect(result.next).toBe(0);
  });

  test("idle has one frame and no duration (static)", () => {
    expect(FRAMES["idle"]!.length).toBe(1);
    expect(ANIMATIONS["idle"]!.frameDurationMs).toBe(0);
  });

  test("frame durations are within natural range (100–500ms)", () => {
    for (const [name, config] of Object.entries(ANIMATIONS)) {
      if (name === "idle") continue;
      expect(config.frameDurationMs).toBeGreaterThanOrEqual(100);
      expect(config.frameDurationMs).toBeLessThanOrEqual(500);
    }
  });

  test("all animations have between 1 and 8 frames per PRD", () => {
    for (const name of ANIMATION_NAMES) {
      const frames = FRAMES[name]!;
      expect(frames.length).toBeGreaterThanOrEqual(1);
      expect(frames.length).toBeLessThanOrEqual(8);
    }
  });
});
