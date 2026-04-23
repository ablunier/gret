import { test, expect, describe } from "bun:test";
import { FRAMES } from "../frames";
import { ANIMATIONS, ANIMATION_NAMES } from "../animation-registry";

describe("frames", () => {
  test("every registered animation has at least one frame", () => {
    for (const name of ANIMATION_NAMES) {
      expect(FRAMES[name]).toBeDefined();
      expect(FRAMES[name]!.length).toBeGreaterThanOrEqual(1);
    }
  });

  test("all frames are non-empty strings", () => {
    for (const [name, frames] of Object.entries(FRAMES)) {
      for (const frame of frames) {
        expect(typeof frame).toBe("string");
        expect(frame.length).toBeGreaterThan(0);
      }
    }
  });

  test("idle has exactly one frame", () => {
    expect(FRAMES["idle"]!.length).toBe(1);
  });

  test("thinking has at least 2 frames and loops", () => {
    expect(FRAMES["thinking"]!.length).toBeGreaterThanOrEqual(2);
    expect(ANIMATIONS["thinking"]!.loop).toBe(true);
  });

  test("all non-thinking animations do not loop", () => {
    for (const [name, config] of Object.entries(ANIMATIONS)) {
      if (name !== "thinking") {
        expect(config.loop).toBe(false);
      }
    }
  });

  test("animation count matches PRD requirement of 15", () => {
    expect(ANIMATION_NAMES.length).toBe(15);
  });

  test("all frame durations are positive for multi-frame animations", () => {
    for (const [name, config] of Object.entries(ANIMATIONS)) {
      const frames = FRAMES[name];
      if (frames && frames.length > 1) {
        expect(config.frameDurationMs).toBeGreaterThan(0);
      }
    }
  });
});
